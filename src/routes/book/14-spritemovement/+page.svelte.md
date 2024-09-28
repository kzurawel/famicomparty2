---
title: 14. Sprite Movement
prev:
  url: 13-backgroundgraphics
  title: 13. Background Graphics
next:
  url: 15-scrolling
  title: 15. Background Scrolling
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Nes from '$lib/components/Nes.svelte';
</script>

In the last chapter, we created background graphics to display
behind our sprites. While the addition of backgrounds helps
make our game look more like an actual game, it is still
entirely static - no different from a still picture. In this
chapter, we'll look at how to move sprites around the screen.
To do so, we will need to make some changes to how our game
is drawing sprites.

First, we can no longer hard-code the positions of our sprites
in cartridge ROM.<Margin id="cartridgerom">As a reminder, "cartridge ROM" or PRG-ROM is the read-only part of your game, and in the NES' memory map, it is located from $8000 to $ffff. All of your game's code is located there, though your game code can refer to memory addresses outside of PRG-ROM, like when we wrote sprite data to $0200-$02ff.</Margin> There are many choices for where we could put our
sprite's information, but the best location is "zero-page RAM".

## Zero-Page RAM

A "page" of memory on the NES is a contiguous block of 256 bytes
of memory. For any memory address, the _high_ byte determines the
page number, and the _low_ byte determines the specific address
within the page. As an example, the range from `$0200` to `$02ff`
is "page `$02`", and the range from `$8000` to `$80ff` is
"page `$80`".

What, then, is "zero-page RAM"? Page zero is the range of memory
from `$0000` to `$00ff`. What makes page zero useful for things
like sprite positions is its speed. The 6502 processor has a
special addressing mode for working with zero-page RAM, which
makes operations on zero-page addresses much faster than the
same operation on other memory addresses. To use zero-page
addressing, use one byte instead of two when providing a memory
address. Let's look at an example:<Margin id="zeropagemode">Note that you <em>must</em> use just one byte in order to take advantage of zero-page addressing mode. The assembler does not know anything about the memory addresses passing through it. If you were to type <code>LDA $003b</code> instead of <code>LDA $3b</code> in your assembly code, the resulting machine code would use (slower) absolute mode, even though the memory address you are loading from is located in page zero.</Margin>

```ca65
  LDA $8000 ; "regular", absolute mode addressing
            ; load contents of address $8000 into A

  LDA $3b   ; zero-page addressing
            ; load contents of address $003b into A

  LDA #$3b  ; immediate mode addressing
            ; load literal value $3b into A
```

So, using zero-page addressing gives us very fast access to 256
bytes of memory. Those 256 bytes are the ideal place to store
values that your game will need to update or reference frequently,
making them an ideal place to record things like the current score,
the number of lives the player has, which stage or level the player
is in, and the positions of the player, enemies, projectiles,
etc.<Margin id="metatiles">Notice that I said the position of "the player", and not the positions of the individual tiles that make up the player. Any game that hopes to have more than a very small number of objects on screen at one time will need to carefully ration the use of zero-page addresses.</Margin>

Let's start using zero-page RAM in our code. Because only addresses from
`$8000` and up are ROM (i.e., part of your actual cartridge / code that
you write), we can't just write zero page values directly. Instead, we
tell the assembler to _reserve_ memory in page
zero,<Margin id="reservingmemory">Note the ":" after the name of each reserved byte - these look like the labels that we've already been using, and that's because they are! When we use the name of a reserved byte later in our code, we're telling the assembler to find the memory address that corresponds to that label and replace the name with the address, exactly the same as any other label in our code.</Margin> like this:

```ca65
.segment "ZEROPAGE"
player_x: .res 1
player_y: .res 1
```

First, we tell the assembler that we want to reserve page zero memory
by using the appropriate segment from our linker config file - in this
case, `"ZEROPAGE"`. Then, for each memory range we want to reserve,
we use the `.res` directive, followed by the number of bytes we want
to reserve. Generally this will be "1" to reserve a single byte of memory,
but being able to specify any number can be useful if, for example,
you need to store a 16-bit number in page zero.

Now that we have reserved memory, we need to initialize it to a good
starting value somewhere in our code. Two good options for this are
either as part of the reset handler, or at the beginning of `main`.
We'll opt for the reset handler approach here. In `reset.asm`, just
before `JMP main`, add the following code:

```ca65
  ; initialize zero-page values
  LDA #$80
  STA player_x
  LDA #$a0
  STA player_y
```

If you try to assemble this code, however (`ca65 src/reset.asm`), you
will get an error:

```shell
Error: Symbol 'player_y' is undefined
Error: Symbol 'player_x' is undefined
```

Generally, reserved memory names are only valid in the same file
where they are defined. In this case, we reserved `player_x` and
`player_y` in our main file, but we were trying to use them in
`reset.asm`. Thankfully, ca65 provides directives to export and
import reserved zero-page memory so it can be shared between files.
We'll just need to add an `.exportzp` directive in our main file:

```ca65
.segment "ZEROPAGE"
player_x: .res 1
player_y: .res 1
.exportzp player_x, player_y
```

Then, in `reset.asm`, we can use an `.importzp` directive:<Margin id="importzp">The <code>.importzp</code> directive should go inside of a <code>.segment "ZEROPAGE"</code>, even if you are not doing anything else with page zero values in that file.</Margin>

```ca65
.segment "ZEROPAGE"
.importzp player_x, player_y
```

When you assemble these files, ca65 will look through the
other source files in the same directory looking for imports
and exports and it will figure out what data should go where.

## Subroutines

Since we only have a limited number of zero-page addresses (256)
available, we need to ration them out carefully. Instead of
storing the position of every player sprite tile individually
(which would take 8 bytes of zero page just for x/y positions),
we will store just an overall player X and Y coordinate and
offload the drawing of the actual player sprites to a _subroutine_.
Subroutines are assembly's version of functions - named, reusable
code fragments.

To create a subroutine, make a new `.proc` in your code. The only
requirement for a subroutine is that it _must_ end with the opcode
`RTS`, "Return from Subroutine". To _call_ a subroutine, use the
opcode `JSR`, "Jump to Subroutine", followed by the name of
the subroutine (whatever follows `.proc`).

Before we go further, let's take a look at what actually happens when
we call a subroutine. Here is some example code:

```ca65 showLineNumbers
  LDA #$80
  JSR do_something_else
  STA $8000

.proc do_something_else
  LDA #$90
  RTS
.endproc
```

When this code runs, the processor first puts the literal value
`$80` into the accumulator. Then it calls the subroutine `do_something_else`.
When the 6502 sees a `JSR` opcode, it pushes the current value
of the program counter (the special register that holds the
memory address of the next byte to be processed) onto the _stack_.
A stack, in computer science, is a "last in, first out" data structure,
similar to a stack of real-life plates. Adding something to the stack
means putting it on top of the pile, and only the top-most element
is available at any given time.

On the 6502, the stack is 256 bytes in size and is located at
`$0100` to `$01ff`. The 6502 uses a special register,
the "stack pointer" (often abbreviated "S"), to indicate where the
"top" of the stack is. When the system is first initialized, the
value of the stack pointer is `$ff`. Every time something is stored
on the stack, it is written to `$0100` plus the address held in the stack pointer
(e.g., the first write to the stack is stored at `$01ff`), and
then the stack pointer is decremented by one.<Margin id="stackoverflow">Attempting to write more than 256 items to the stack at one time causes the stack pointer to wrap around from $00 to $ff, meaning that further writes to the stack will overwrite already existing stack data. This generally-catastrophic scenario is called a <em>stack overflow</em> (though in the case of the 6502, it's more properly called a stack <em>underflow</em>).</Margin> When a value is removed from the stack, the stack pointer
is incremented by one.

So, on line 2, the processor sees a `JSR` opcode and stores the current
value of the program counter on the stack. Then, it takes the operand
of the `JSR` and puts that memory address into the program counter.
Here, the processor skips from line 2 to line 6, and writes the literal
value `$90` to the accumulator. The next opcode is an `RTS`. When the
6502 sees an `RTS`, it takes the "top" value from the stack (often referred
to as "popping" and item off the stack) and puts it into the program
counter. Given the way the stack works, this _should_ be the address
that was "pushed onto" the stack back when the processor saw a `JSR`.
This pulls us back to whatever code is immediately after the `JSR`.
Here, that means `STA $8000` - and the result will be writing `$90`
to that memory address, not `$80`. Subroutines do not, by default, "save" the
values of any registers either when they are called or when they return.
In most higher-level programming languages, this is taken care of for you
through concepts like "variable scope" or "lifetimes". In assembly, though,
you must handle saving and restoring the state of all registers (including
the processor status register!) if you need those values to remain the
same when returning from a subroutine.<Margin id="whentosave">Thankfully, since
the NES is single-threaded, the only thing that can alter register values
without your knowledge is an interrupt vector - by definition, they _interrupt_
the normal flow of your code. That means that the main place to use this
technique is in your NMI handler.</Margin>

## Register Management

To help you save and restore the contents of registers, the 6502
provides four opcodes: `PHA`, `PHP`, `PLA`, and `PLP`. `PHA` and
`PHP` are used to "push" the accumulator ("A") and processor status
register ("P"), respectively, onto the stack. In the other direction,
`PLA` and `PLP` "pull" the top value off of the stack and place it
into the accumulator or processor status register. There are no
special opcodes for the X and Y registers; to push their
values, you must first transfer them into the accumulator (with
`TXA` / `TYA`), and to restore them you must pull into the
accumulator and then transfer again (with `TAX` / `TAY`).

Let's look at how you might use these new opcodes in your NMI handler:

```ca65
.proc nmi_handler
  PHA
  TXA
  PHA
  TYA
  PHA

  ; your actual NMI code here

  PLA
  TAY
  PLA
  TAX
  PLA
  RTI
.endproc
```

When the NMI handler is called, the
first six opcodes preserve the state of the registers on the stack
before doing anything else. First, we push the value of the accumulator, and then transfer and
push the values of the X and Y registers. With everything stored on
the stack, we are free to use all of the 6502's registers without
worrying about what the code that was interrupted expects
to find in them. Once the NMI handler is finished, we reverse
all of the storing we did at the beginning. We restore everything in the
opposite order of how we stored it, first pulling and transferring to
the Y and X registers, then the accumulator. Finally, we end with `RTI`, which returns program flow
to the point where the NMI handler was called. For a subroutine, we
would end with `RTS` (Return from Subroutine) instead.<Margin id="rts">If you forget to include <code>RTS</code> at the end of your subroutine, the 6502 will not return to where the subroutine was called and will instead happily continue with the next byte after your subroutine code. The processor doesn't know anything about <code>.proc</code>s, they are simply a tool to help <em>you</em> organize your code.<br><br>
Additionally, subroutines might need to add `PHP` at the beginning and `PLP` at the end to save and restore the processor status register.
`PHP` must be run before any other opcode, and `PLP` must be the last instruction before `RTS`, because most opcodes change
the value of the processor status register. Here, we don't need it, because interrupts automatically save and restore the processor
status register. If the state of the processor status register does not matter (because, for example, you explicitly check for
flags before trying to make use of them), then your subroutines can skip `PHP`/`PLP` as well.</Margin>


## Your First Subroutine: Drawing the Player

Now that you've seen how subroutines work, it's time to create your
own. Let's write a subroutine that draws the player's ship at a given
location. To do that, we'll need to use the `player_x` and `player_y`
zero-page variables we created earlier to write the appropriate bytes
to memory range `$0200`-`$02ff`. Previously, we did this by storing
the appropriate bytes in `RODATA` and copying them with a loop and
indexed addressing, the same way we did with palettes. As a quick
refresher, we need to write four bytes of data for each 8 pixel by
8 pixel sprite tile: the sprite's Y position, tile number, special
attributes / palette, and X position. The tile number and palette
for each of the four sprites that make up the player ship will not
change, so let's start there.

```ca65
.proc draw_player
  ; write player ship tile numbers
  LDA #$05
  STA $0201
  LDA #$06
  STA $0205
  LDA #$07
  STA $0209
  LDA #$08
  STA $020d

  ; write player ship tile attributes
  ; use palette 0
  LDA #$00
  STA $0202
  STA $0206
  STA $020a
  STA $020e

  ; return to where the subroutine was called
  RTS
.endproc
```

The player ship uses tiles `$05` (top left), `$06` (top right),
`$07` (bottom left), and `$08` (bottom right). We write those
tile numbers to memory addresses `$0201`, `$0205`, `$0209`, and
`$020d`, respectively, because those correspond to "byte 2" of
the first four sprites. All of the player ship's tiles use
palette zero (the first palette), so the code to write sprite
attributes is much shorter. `$0202`, `$0206`, `$020a`, and `$020e`
are the bytes immediately following the previous tile number
bytes, and so they hold the attributes for each of the first
four sprites. Finally, we use `RTS` to end the subroutine.

What about the _location_ of each tile on screen? For that, we
will need to use `player_x`, `player_y`, and some basic math.
Let's assume, to make things easier, that `player_x` and
`player_y` represent the top left corner of the top left tile
of the player's ship. In our reset handler, we positioned
the top left corner of the top left player ship tile at
(`$70`, `$a0`). Once we have placed the top left tile,
we can add eight pixels to `player_x` and `player_y` to
find the positions of the other three tiles.

In the past, we have used `INC` / `DEC` to add or subtract.
When adding or subtracting more than 1, however, there
are more efficient opcodes - specifically, `ADC` ("ADd with Carry").

Here's what that
looks like (previous code reduced to just comments):

```ca65
.proc draw_player
  ; store tile numbers
  ; store attributes

  ; store tile locations
  ; top left tile:
  LDA player_y
  STA $0200
  LDA player_x
  STA $0203

  ; top right tile (x + 8):
  LDA player_y
  STA $0204
  LDA player_x
  CLC
  ADC #$08
  STA $0207

  ; bottom left tile (y + 8):
  LDA player_y
  CLC
  ADC #$08
  STA $0208
  LDA player_x
  STA $020b

  ; bottom right tile (x + 8, y + 8)
  LDA player_y
  CLC
  ADC #$08
  STA $020c
  LDA player_x
  CLC
  ADC #$08
  STA $020f

  ; return to where the subroutine was called
  RTS
.endproc
```

Remember that when you want to perform addition, first
call `CLC`, then use `ADC` (unless you're trying to add
something to a 16-bit number, which will be rare for now).
The result of the addition can be found in the accumulator;
it does not get written to `player_y` or `player_x`.

## Putting It All Together

With our subroutine written, it's time to make use of it.
We already set up the initial values of `player_x` and
`player_y` in the reset handler. Now, we'll call our
new subroutine as part of the NMI handler, so it runs
every frame:

```ca65 showLineNumbers{15}
.proc nmi_handler
  ; save registers
  PHA
  TXA
  PHA
  TYA
  PHA

  LDA #$00
  STA OAMADDR
  LDA #$02
  STA OAMDMA

  ; update tiles *after* DMA transfer
  JSR draw_player

  LDA #$00
  STA $2005
  STA $2005

  ; restore registers
  PLA
  TAY
  PLA
  TAX
  PLA

  RTI
.endproc
```

Notice that we perform a DMA transfer of whatever is
already in memory range `$0200`-`$02ff` _before_
calling our subroutine. The amount of time you have
available to complete your NMI handler is very short,
so putting your DMA transfer first ensures that at
least _something_ will be drawn to the screen each frame.

Finally, we need to update `player_x` each frame so
that our sprites will actually move around the screen.
For this example, we will keep `player_y` the same,
but we will modify `player_x` so that the player's ship
moves to the right until it is near the right edge of the
screen and then moves left until it is near the left
edge of the screen. To make this easier, we'll need
to store what direction the player's ship is moving
in. Let's add another zero page variable, `player_dir`.
A `0` will indicate that the player's ship is moving
left, and a `1` will indicate that the player's ship
is moving right.

```ca65
.segment "ZEROPAGE"
player_x: .res 1
player_y: .res 1
player_dir: .res 1
.exportzp player_x, player_y
```

I did not export `player_dir` because other files do not
(yet) need to access it. Now we can write the code to
update `player_x`. We could write out this code as part
of the NMI handler directly, but in anticipation of more
complicated player movement in the future, let's put
it into its own subroutine, `update_player`:

```ca65
.proc update_player
  LDA player_x
  CMP #$e0
  BCC not_at_right_edge
  ; if BCC is not taken, we are greater than $e0
  LDA #$00
  STA player_dir    ; start moving left
  JMP direction_set ; we already chose a direction,
                    ; so we can skip the left side check
not_at_right_edge:
  LDA player_x
  CMP #$10
  BCS direction_set
  ; if BCS not taken, we are less than $10
  LDA #$01
  STA player_dir   ; start moving right
direction_set:
  ; now, actually update player_x
  LDA player_dir
  CMP #$01
  BEQ move_right
  ; if player_dir minus $01 is not zero,
  ; that means player_dir was $00 and
  ; we need to move left
  DEC player_x
  JMP exit_subroutine
move_right:
  INC player_x
exit_subroutine:
  ; all done, return
  RTS
.endproc
```

This subroutine makes heavy use of the branching and
comparison opcodes we saw in [Chapter 11](/book/11-branchingandloops).
We first load `player_x` into the accumulator and compare
with `$e0`. `CMP`, as we learned earlier, subtracts its
own operand from the accumulator, but only sets the carry
and zero flags. We can use the resulting processor status
register flags to tell us whether the value in the accumulator
(in this case, `player_x`) was greater than, equal to, or
less than `CMP`'s operand. `BCC not_at_right_edge` tells
the 6502 to skip ahead to `not_at_right_edge` if the carry
flag is cleared. When performing a subtraction as part of
a comparison, the 6502 first sets the carry flag, and it
is only cleared if the accumulator is smaller than `CMP`'s
operand. In this case, if the accumulator is smaller than
`$e0`, we know we are not near the right edge of the screen,
so we can skip ahead to `not_at_right_edge`. If the accumulator
is greater than `$e0`, the carry flag will still be set and
the 6502 will continue with the next line. In that case,
we are near the right edge of the screen, so we will need
to update `player_dir` with a zero (to signify "moving left").
Then we use `JMP` to skip over the checks for whether or
not we are near the left edge of the screen, because we already
know that's not possible.

If the result of the first comparison was that `player_x` is
not near the right edge of the screen, it's time to test if
`player_x` is near the left edge of the screen. We compare
`player_x` with `$10`, and this time we use `BCS direction_set`.
`BCS`, as explained above, will activate if the accumulator
(`player_x`) was larger than the comparison value (`$10`).
In that case, we are not near the left edge and can skip
forward to actually updating `player_x`. Otherwise, we need
to update `player_dir` to be `$01`, indicating "move
right".<Margin id="notedges">Note that, with the way <code>update_player</code> is structured, if the player's ship is not near <em>either</em> edge of the screen, <code>player_dir</code> will not be updated, but we will still increment or decrement <code>player_x</code> as appropriate.</Margin>

Finally, it's time to actually use the results of our
edge tests. We compare `player_dir` with `$01` and look
to see if the result is zero. If it is, `BEQ move_right`
activates and we increment `player_x`. Otherwise, we
decrement `player_x`. Having performed our update,
we restore all of the registers and return from the subroutine.

Let's call our new subroutine inside of the NMI handler
to finish off our example project:

```ca65 showLineNumbers{30}
  ; update tiles *after* DMA transfer
  JSR update_player
  JSR draw_player
```

All that's left is to assemble and link the files
into a NES ROM:

```shell
ca65 src/spritemovement.asm
ca65 src/reset.asm
ld65 src/reset.o src/spritemovement.o -C nes.cfg -o spritemovement.nes
```

If you open the resulting `.nes` file in an emulator,
you should see this:

<Nes rom="/roms/spritemovement.nes" />

## Homework

Now that you understand the basics of moving sprites around
the screen, try these projects to explore and deepen your
understanding.

- Make the player ship move faster. Currently, we move the
player's ship one pixel per frame, or 60 pixels per second.
How would you make that movement faster?
- Change `player_y` instead of (or in addition to) `player_x`.
Keep in mind that sprite Y positions greater than `$e0` will
be below the bottom of the viewable screen area.
- What happens if, instead of checking the left and right
edges of the screen, you just `INC player_x` (or `DEC player_x`)
every frame?  It's simple enough that you could do it directly
in the NMI handler, without even touching `update_player`.
- Add additional sprites and move them separately from the
player ship sprite.

To help you get started, you can download <a href="https://famicom.party/book/projects/14-spritemovement.zip">all of the code from this chapter</a>.
