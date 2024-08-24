---
title: 17. Object Pools
prev:
  url: 16-input
  title: 16. Controller Input
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Nes from '$lib/components/Nes.svelte';

  import enemies from './enemytypes.png?w=520&format=webp';
</script>

With the ability to control the spaceship, our sample
project is starting to feel like a real game and not
just a tech demo. Let's continue to build on that
momentum by introducing enemy spaceships. For now, we
won't worry about detecting collisions - that will come
in the next chapter. Instead, the main focus in
this chapter will be _object pools_, a technique for
handling multiple objects in a flexible way.

## Why Pooling?

In the context of this book, we'll consider an object pool
to be a fixed block of memory that is used to hold data
about a particular type of entity in a game. Each entity
needs to track certain information&mdash;what tiles it
is drawn with, its X and Y positions, etc.&mdash;and that
information will need to be stored somewhere in memory.
In games that are not turn-based, entities are updated
nearly every frame, meaning the best place to store
an entity's data is in zero-page RAM.

In modern game development environments, adding a few more
entities when needed is not a concern. Modern systems
can easily spare a few bytes (or kilobytes, or megabytes)
for additional entities. On the NES, though, zero-page
space is limited and finite, so every byte has to be
planned in advance.  Setting up an object pool guarantees
that the game will never use more memory than we
allocated in advance, and lets us more easily plan out
how the 256 bytes of zero-page space will be used.

Object pools also help from a gameplay perspective. If
we use an object pool for player projectiles and give
it three slots, then the player can only have three
projectiles on screen at one time. Without that kind
of limitation, a player could use a turbo controller
(or tap rapidly) to fill the screen with projectiles,
taking up all of the OAM slots, making a number of
sprites invisible due to the eight-sprites-per-scanline
limitation and likely causing massive slowdown due
to the additional demands on collision detection.

## Designing Pools

An object pool should be flexible enough to accommodate
a range of entity types, so long as those entities have
some shared role. It is common to put entities that can
harm the player into a pool together, separate from
entities that are neutral or helpful. An alternative
approach could be keeping objects that participate in
collision detection in one pool, and those that do not
in another. There is no set way of deciding what goes
into a pool together and what does not. In general,
a good object pool design will make it easy to iterate
through the entities in the pool to do common tasks,
without needing to write logic that excludes certain
entities. As an example, if you put both enemies and
player projectiles into a single pool, collision
detection would be extremely complicated, since you
would need to constantly test whether any two items
can actually affect one another. Separate pools for enemies
and player projectiles let you cycle through the entities
in one pool and compare them to entities from the
other, greatly reducing the complexity.

Once you've decided which types of entities will be
pooled together, the next step is establishing what data
you will be storing for each entity. For reasons we'll get
to soon, each entity in a pool will need to store the same
data as every other entity in the pool. For our
space shooter game, we will make an enemies pool, where
each enemy has the following data:

- X position
- Y position
- X velocity
- Y velocity
- Bit flags:
  - Type (determines what sprites to draw, etc.)
  - Active flag (should this be updated / drawn / etc.?)

This is a good starting point, but there is plenty of other
data you could choose to store. You could give each enemy
a health counter, allowing enemies to take more than one
attack to defeat. Enemies will likely need some kind of
"AI" behavior; you could keep a list of behaviors somewhere
else in code and reference the current behavior pattern
with an ID number. Enemies could also have animations,
which would require you to store the current animation state
(animation type and frame number) for each entity. Note
that even if we add all of these properties, the
pool is still quite flexible. Giving pool entities a
"type" value could translate into nearly anything, since
the code that transforms a type number into sprites drawn
on screen can live outside of the pool. This pool could
easily handle enemies ranging from a single sprite tile to
giant boss monsters without any changes.

Similarly, let's create a pool to store player projectiles.
Player projectiles do not share a role with enemies, and since
they don't vary much from one another, the pool design can be
simpler as well:

- X position
- Y position

Here we assume that all projectiles have the same velocity
and use the same graphics, so all we need to track is their
position on screen. If you wanted to add different weapons
(or weapon upgrades), you would need to add more data to
the entities in the pool.

## Implementing object pools

In most modern programming languages, if you wanted to
track a set of similar entities, you would reach for something
like an array of objects (or a list of instances, or a slice
of structs; the terminology here varies by language). Here's
an example of that approach in JavaScript:

```shell
let enemiesPool = [
  {
    x: 57,
    y: 12,
    type: 3,
    active: true
  },
  {
    x: 36,
    y: 12,
    type: 3,
    active: false
  }
];
```

This method makes it very easy to loop through the objects
within the array, and then take action on each object in turn.
On the NES, however, this approach is very inefficient.
Using this sort of setup (which is called _array of structures_),
NES assembly code to loop through all entities would need to:

1. Store a "current object address" and "current object index" somewhere, as well as the length of each field and the total length of each object.
2. Access each property of the current object by using a table of offsets from the start of the object (load the offset of the property into the X register, then e.g.  `LDA current_obj_address, X`).
3. To get to the next object, add the object length to the current object's starting address.
4. Check each time you move to the next object that the current object index has not exceeded the total length of the array.

In contrast, due to the 6502's wealth of addressing modes, a more
popular approach on the NES is the _structure of arrays_. To go back
to our previous JavaScript example, a structure of arrays approach
would look like this:

```shell
let enemiesPool = {
  x: [57, 36],
  y: [12, 12],
  type: [3, 3],
  active: [true, false]
};
```

While this approach might seem counter-intuitive at first, it
works very well with the 6502's indexed addressing modes.
Here is our hypothetical pool traversal code under structure
of arrays:

1. Store a current object index in the X register.
2. To look up a property, use indexed addressing with the label that marks the start of that array, e.g. `LDA enemy_types, X` to get the type of the current enemy.
3. To go to the next object in the pool, increment the X register.
4. Check each time you increment if the current object index has exceeded the length of the pool.

The number of steps is the same, but each step is much simpler and
also faster to execute.

Now that we have both a design and an implementation approach for
the pool, let's actually create it. We'll need to add the following
to our `.segment "ZEROPAGE"`:

```ca65
NUM_ENEMIES = 5

; enemy object pool
enemy_x_pos: .res NUM_ENEMIES
enemy_y_pos: .res NUM_ENEMIES
enemy_x_vels: .res NUM_ENEMIES
enemy_y_vels: .res NUM_ENEMIES
enemy_flags: .res NUM_ENEMIES

; player bullet pool
bullet_xs: .res 3
bullet_ys: .res 3

; export all of this
.exportzp enemy_x_pos, enemy_y_pos
.exportzp enemy_x_vels, enemy_y_vels
.exportzp enemy_flags
```

With this code, we've reserved 31 bytes of zero-page RAM across
two pools, to store the state of our non-player objects in a
structure of arrays format. The `enemy_flags` byte for each
enemy is a series of bitfields; here, I'll use three bits to store the
enemy type (giving us eight possible enemy types), one bit to
store whether or not the enemy at this slot is 'active' (should
be drawn to the screen), and four bits reserved for future use.

To make use of these pools, we will want to cycle through them
each frame, making any updates as needed. For now, this
will be relatively simple: creating new enemies if there are
open slots, updating the positions of existing enemies, and
freeing up enemy slots when they have exited the screen.
In the future, this loop is where we will add collision
detection, "AI" behavior, and animation updates.

Because there will be so much going on in this loop, there is
actually one more thing to do before we implement it. Up to
this point, our `main` code has set things up and then just
waited for NMIs to occur, with all actual logic being part of
the NMI handler. While our projects were simple, this was
sufficient, but as we add more and more functionality,
we will quickly run out of CPU time. Vblank (the time during
which the NMI handler runs) lasts for about 2,250 CPU
cycles, which is a decent amount but not a whole lot of time.
In contrast, the CPU spends about _27,000 cycles_ outside
of Vblank each frame. Currently, that time is wasted just
waiting for the next Vblank. A better approach would be
to spend that time _setting things up_ for the next
Vblank, and letting our NMI handler focus on sending those changes
to the PPU.<Margin id="framenmis">Nearly all of this section is based on <a href="https://www.nesdev.org/wiki/The_frame_and_NMIs">"The frame and NMIs"</a>, from the <a href="https://www.nesdev.org/wiki/Nesdev_Wiki">NESDev Wiki</a>.</Margin>

## Moving code from NMI to main

To make the most of Vblank time, we'll want to limit the
NMI handler to only handling things that occur
every frame - even if the game is paused, or slowdown is
occurring. Generally those items will include:

- Copying sprite data to OAM;
- Making any per-frame background updates;
- Updating the scroll registers;
- Playing music and sound effects.

Everything else should be handled as part of the main loop,
since there is so much more CPU time available there. In
fact, there is so much CPU time available that we will need
to do something to keep the CPU busy while we wait for
the next Vblank, or else our game logic will race far ahead
of what is being displayed on the screen. To start, we need
a way to track whether or not Vblank (an NMI) has occured yet.
I'll use one byte of zeropage to track whether the non-Vblank
code should "sleep" (wait for NMI), or run itself.

```ca65
sleeping: .res 1
```

If `sleeping` is non-zero, we are waiting for the next NMI
before doing anything else. The end of our main loop can change
from the current "jump forever":

```ca65
forever:
  JMP forever
```

To something that takes sleeping into account:

```ca65
  INC sleeping
sleep:
  LDA sleeping
  BNE sleep

  JMP mainloop
```

Here, we increment `sleeping` so it is not zero and then
repeatedly load it, until a load results in zero. How does
`sleeping` revert to zero? In our NMI handler. At the end
of the NMI handler, we add:

```ca65
  LDA #$00
  STA sleeping
```

So, the entire flow is now:

- Reset handler runs at power-on (or reset), and ends with
`JMP main`
- Main code (outside of Vblank) runs until it hits the
`sleep` loop, which sets `sleeping` to one and waits for NMI
- At Vblank time, NMI handler runs, and sets `sleeping` back to zero
- Main code, still in the `sleep` loop, sees that `sleeping`
is now zero and jumps back to the beginning of the loop

Now, the main loop and the NMI handler pass control back and
forth to one another, letting us make the most of both. Note
that the end of our `main` proc jumps to a new label - `mainloop` -
instead of jumping back to the beginning of `main`. `main` begins
with some initialization that we don't want to repeat
every frame, so we need to add a `mainloop` label within
`main` at the point that we want to run repeatedly.

It's time to move code that is not
essential to NMIs out into the main loop. Looking through the
NMI handler from the last chapter, the following operations are
worth keeping in NMI (because they can only be done during Vblank):

- Copying sprite data to OAM
- Setting PPUCTRL
- Setting scroll values

The rest (including calculating what values to write
to PPUCTRL and decrementing `scroll`) should be moved
to the main loop. If we remove those items, our new,
shorter NMI handler looks like this:

```ca65
.proc nmi_handler
  PHP
  PHA
  TXA
  PHA
  TYA
  PHA

  ; copy sprite data to OAM
  LDA #$00
  STA OAMADDR
  LDA #$02
  STA OAMDMA

  ; set PPUCTRL
  LDA ppuctrl_settings
  STA PPUCTRL

  ; set scroll values
  LDA #$00 ; X scroll first
  STA PPUSCROLL
  LDA scroll
  STA PPUSCROLL

  ; all done
  LDA #$00
  STA sleeping

  PLA
  TAY
  PLA
  TAX
  PLA
  PLP
  RTI
.endproc
```

Next, let's move the items we removed from the
NMI handler into the main loop. Here is just the
`mainloop` portion of our new `.proc main`:

```ca65
mainloop:
  ; Read controllers.
  JSR read_controller1

  ; Update the player and prep to draw
  JSR update_player
  JSR draw_player

  ; Check if PPUCTRL needs to change
  LDA scroll ; did we reach the end of a nametable?
  BNE update_scroll
  ; if yes,
  ; Update base nametable
  LDA ppuctrl_settings
  EOR #%00000010 ; flip bit 1 to its opposite
  STA ppuctrl_settings
  ; Reset scroll to 240
  LDA #240
  STA scroll

update_scroll:
  DEC scroll

  ; Done processing; wait for next Vblank
  INC sleeping
sleep:
  LDA sleeping
  BNE sleep

  JMP mainloop
```

Most of this is copied as-is from the old NMI handler,
but note that _we are not writing to PPUCTRL here_.
Writes to the PPU can only occur during Vblank
(in the NMI handler), or else you will get distracting
visual artifacts on the screen.

With the main loop and NMI now separated, we have ample
time to make use of our new object pools in the main loop
to generate, draw, and manage enemies and projectiles
in the game.

## Enemy routines

We'll need some enemies to manage, of course. I've created
graphics tiles for two enemy types, seen here:

<figure>
  <img src={enemies} alt="" />
  <figcaption>Our two enemy types - space turtles and galactic snakes. I am not an artist but I'm trying my best.</figcaption>
</figure>

I'm going to call the turtles "type 1" and the snakes
"type 2", and we will use those values in the "type"
field for each enemy in the pool. Those types will
let us easily determine which subroutines to call
in order to update a particular enemy and draw it.
For better organization, I am going to put enemy
subroutines into their own file, `enemies.asm`,
and import them into the main file.

The drawing subroutine is the simpler of the two.
If all of our enemy types can be drawn with 2x2
tile metasprites, they can share a single drawing
routine that picks tiles to draw based on enemy
type.<Margin id="different-sizes">If the enemies are different sizes, then multiple drawing subroutines will be required. Instead of calling <code>draw_enemy</code> directly, the code that loops through the enemy pool will need to check the enemy's type to determine the appropriate draw function.</Margin> Using `current_enemy` as an index into various arrays,
the drawing subroutine can:

- Find the appropriate place in OAM to write sprite data
- Write sprite X and Y positions with values from `enemy_x_pos` and `enemy_y_pos`
- Identify the tiles to write using `enemy_flags` and a lookup table of tile numbers
- Select an appropriate palette

The drawing subroutine will need
to make use of both index registers: one to provide an
offset into each enemy info array, and one to keep track
of the offset into OAM as each byte is written.
Additionally, the X register will need to do double duty,
generally using `current_enemy` for offsets, but changing
to the current enemy's type (stored in zeropage as
`current_enemy_type`) when loading tile numbers.
I am using bit 7 of the `enemy_flags` byte as a marker for
"active" or "inactive". As discussed in a previous chapter,
that bit can be turned on with `ORA #%10000000`, and turned
off with `EOR #%10000000`.
Here is the drawing subroutine (in `enemies.asm`):

```ca65 showLineNumbers{126}
.export draw_enemy
.proc draw_enemy
  ; First, check if the enemy is active.
  LDX current_enemy
  LDA enemy_flags,X
  AND #%10000000
  BNE continue
  JMP done

continue:
  ; Find the appropriate OAM address offset
  ; by starting at $0210 (after the player
  ; sprites) and adding $10 for each enemy
  ; until we hit the current index.
  LDA #$10
  LDX current_enemy
  BEQ oam_address_found
find_address:
  CLC
  ADC #$10
  DEX
  BNE find_address

oam_address_found:
  LDX current_enemy
  TAY ; use Y to hold OAM address offset

  ; Find the current enemy's type and
  ; store it for later use. The enemy type
  ; is in bits 0-2 of enemy_flags.
  LDA enemy_flags, X
  AND #%00000111
  STA current_enemy_type

  ; enemy top-left
  LDA enemy_y_pos, X
  STA $0200, Y
  INY
  LDX current_enemy_type
  LDA enemy_top_lefts, X
  STA $0200, Y
  INY
  LDA enemy_palettes, X
  STA $0200, Y
  INY
  LDX current_enemy
  LDA enemy_x_pos, X
  STA $0200, Y
  INY

  ; enemy top-right
  LDA enemy_y_pos, X
  STA $0200, Y
  INY
  LDX current_enemy_type
  LDA enemy_top_rights, X
  STA $0200, Y
  INY
  LDA enemy_palettes, X
  STA $0200, Y
  INY
  LDX current_enemy
  LDA enemy_x_pos, X
  CLC
  ADC #$08
  STA $0200, Y
  INY

  ; enemy bottom-left
  LDA enemy_y_pos, X
  CLC
  ADC #$08
  STA $0200, Y
  INY
  LDX current_enemy_type
  LDA enemy_bottom_lefts, X
  STA $0200,Y
  INY
  LDA enemy_palettes, X
  STA $0200, Y
  INY
  LDX current_enemy
  LDA enemy_x_pos, X
  STA $0200, Y
  INY

  ; enemy bottom-right
  LDA enemy_y_pos, X
  CLC
  ADC #$08
  STA $0200, Y
  INY
  LDX current_enemy_type
  LDA enemy_bottom_rights, X
  STA $0200,Y
  INY
  LDA enemy_palettes, X
  STA $0200,Y
  INY
  LDX current_enemy
  LDA enemy_x_pos, X
  CLC
  ADC #$08
  STA $0200, Y

done:
  RTS
.endproc
```

Notice that a branch (`BNE`) skips over
a `JMP` to near the end of the subroutine, rather than
branching directly to that label. This is intentional;
a branch command, when assembled into machine code, takes
a relative movement as its operand, and because that
operand is one (signed) byte, a branch can only move up to 128
bytes backward or 127 bytes forward. The `done` label
is more than 127 bytes ahead of where we would branch,
so only a `JMP` can be used here.

In keeping with the structure-of-arrays model, the tile
numbers for each enemy type are stored in four arrays:
`enemy_top_lefts`, `enemy_top_rights`, `enemy_bottom_lefts`,
and `enemy_bottom_rights`. The enemy type serves as the
index into each of these arrays, so e.g. the first enemy
type (type zero) will be the first element of each
array. Here, for reference, are those arrays, down in
`.segment "RODATA"`. Each array lists the appropriate turtle
tile, followed by the appropriate snake tile. These arrays
are stored in `RODATA`.

```ca65 showLineNumbers{248}
.segment "RODATA"

enemy_top_lefts:
.byte $09, $0d
enemy_top_rights:
.byte $0b, $0e
enemy_bottom_lefts:
.byte $0a, $0f
enemy_bottom_rights:
.byte $0c, $10
```

For enemy behavior, I'll keep things simple for now with
a single subroutine that increments the enemy's Y position
by its Y velocity (from `enemy_y_vels`)
and, if it is greater than 239 (the bottom of the screen),
marks it as inactive. This subroutine is also in `enemies.asm`.

```ca65
.export update_enemy
.proc update_enemy
  ; Check if this enemy is active.
  LDX current_enemy
  LDA enemy_flags, X
  AND #%10000000
  BEQ done

  ; Update Y position.
  LDA enemy_y_pos, X
  CLC
  ADC enemy_y_vels, X
  STA enemy_y_pos, X

  ; Set inactive if Y >= 239
  CPY #239
  BCC done
  LDA enemy_flags, X
  EOR #%10000000
  STA enemy_flags, X

done:
  RTS
.endproc
```

With these subroutines written, we are ready (finally?)
to begin spawning enemies.

## Spawning enemies via object pool

There are many approaches to spawning enemies, but let's
keep it simple for now. Each frame, we will use CPU time
(outside of NMI) to loop through the enemies list. If an
enemy slot is active, we will call `update_enemy`. If a slot
is inactive, we will start a timer that counts down from
20 to zero, at which point we will spawn an enemy in the
first inactive slot our loop finds. This gives us a new
enemy 1/3 of a second (20 frames) after an enemy goes off screen.
When not in use, the timer will store `$ff`, to give a
clear difference between "counting down to zero" and
"waiting to start counting down".

First, the code to loop through enemies and update them.
Here is our new subroutine, `process_enemies`, in
`enemies.asm`:

```ca65
.export process_enemies
.proc process_enemies
  ; Start with enemy zero.
  LDX #$00

enemy:
  STX current_enemy
  LDA enemy_flags, X
  ; Check if active (bit 7 set)
  AND #%10000000
  BEQ spawn_or_timer
  ; If we get here, the enemy is active,
  ; so call update_enemy
  JSR update_enemy
  ; Then, get ready for the next loop.
  JMP prep_next_loop
spawn_or_timer:
  ; Start a timer if it is not already running.
  LDA enemy_timer
  BEQ spawn_enemy ; If zero, time to spawn
  CMP #20 ; Otherwise, see if it's running
  ; If carry is set, enemy_timer > 20
  BCC prep_next_loop

  LDA #20
  STA enemy_timer
  JMP prep_next_loop
spawn_enemy:
  ; TODO!

prep_next_loop:
  INX
  CPX #NUM_ENEMIES
  BNE enemy

  ; Done with all enemies. Decrement
  ; enemy spawn timer if 20 or less
  ; (and not zero)
  LDA enemy_timer
  BEQ done
  CMP #20
  BEQ decrement
  BCS done
decrement:
  DEC enemy_timer

done:
  RTS
.endproc
```

This is a large subroutine, but the pieces are
fairly straightforward. The loop that processes
enemies starts at the `enemy` label. Using the
X register as the index of which enemy number is
currently being processed, the loop first checks
if the current enemy is active by testing its
entry in the `enemy_flags` array. If the enemy
is active, `update_enemy` is called and the
rest of the loop logic is skipped. Otherwise,
a new zeropage address (`enemy_timer`) is
checked. A value of 255 means that the timer
is not currently in use; when a timer starts,
it is set to 20 and counts down to zero. If
`enemy_timer` is zero, `BEQ spawn_enemy`
branches to the portion of code that spawns
an enemy (to be described next). If it is
not zero, a second check tests if `enemy_timer`
is greater than 20. If so, the timer is
not currently in use, so a new timer can
be started. Otherwise, the timer is already
in use and we are done processing this enemy.

How should new enemies be spawned? Depending on
the kind of game you are looking to make, a
good approach might be to implement a random
number generator to select the enemy type
to spawn, or hard-coding particular patterns
of enemies that appear during a
stage.<Margin id="stages">The whole idea of having different "modes" in a game - whether that's different playstyles, different stages, or even simple things like a title screen or pause state - will be its own separate chapter.</Margin> Since this chapter is already quite
long, I'm going to opt for something much
simpler instead: specific slots are always
specific enemy types. The first three
slots will be turtles, which will move
at a speed of 1px per frame, and the last
two will be snakes, which will move twice as
fast. Here is the setup code at the beginning
of our `main` subroutine:

```ca65 showLineNumbers{115}
  ; set up enemy slots
  LDA #$00
  STA current_enemy
  STA current_enemy_type

  LDX #$00
turtle_data:
  LDA #$00 ; turtle
  STA enemy_flags,X
  LDA #$01
  STA enemy_y_vels,X
  INX
  CPX #$03
  BNE turtle_data
  ; X is now $03, no need to reset
snake_data:
  LDA #$01
  STA enemy_flags,X
  LDA #$02
  STA enemy_y_vels,X
  INX
  CPX #$05
  BNE snake_data

  LDX #$00
  LDA #$10
setup_enemy_x:
  STA enemy_x_pos,X
  CLC
  ADC #$20
  INX
  CPX #NUM_ENEMIES
  BNE setup_enemy_x
```

Notice also that each enemy slot has a specific
X coordinate, so that they do not overlap with
one another.

Now, when it's time to spawn a new enemy,
the first inactive slot our loop finds is
marked as active and has its Y position set
to zero. Here is that `spawn_enemy` label
from the `process_enemies` subroutine, with
"`TODO`" replaced by actual code:

```ca65
spawn_enemy:
  ; Set this slot as active
  ; (set bit 7 to "1")
  LDA enemy_flags,X
  ORA #%10000000
  STA enemy_flags,X
  ; Set y position to zero
  LDA #$00
  STA enemy_y_pos,X
  ; IMPORTANT: reset the timer!
  LDA #$ff
  STA enemy_timer
```

When all of the code above is assembled and linked,
the result shows off our new object pools in action!

<Nes rom="/roms/objectpools.nes" />

Notice how our object pool limits the game to having
no more than five enemies on screen at a time. Just
having different Y velocities already introduces some
measure of randomness (or at least "random-seeming")
in how enemies appear on screen.

## Homework

Here are a few changes you might like to try out.
See how each of them affects the "feel" of the game,
and experiment with other changes to what we've
already done here. To get you started, here is a
zip file with [the source code from this chapter](/book/projects/17-objectpools.zip).

- Change the number of enemies in the pool, and play with
the ratio of turtles vs. snakes.
- Add a third enemy type. Create new graphics and update
the arrays of tiles, and give the new enemy type its own
Y velocity.
- Give at least one enemy type an X velocity, and update
the `update_enemy` code to add X velocity to X position.
- Instead of hard-coding enemy X positions up front,
when a new enemy spawns, set its X position to the player's
X position at the time of spawning.
- (HARDER) Add the ability for the player to shoot bullets.
Bullets should use the first inactive slot in the bullet pool
to spawn, and should start at the player's X and Y position
at the time they are spawned. You will need to create
your own graphics tiles, drawing routine, etc. as well.
