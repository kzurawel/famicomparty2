---
title: 16. Controller Input
prev:
  url: 15-scrolling
  title: 15. Background Scrolling
next:
  url: 17-objectpools
  title: 17. Object Pools
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Youtube from '$lib/components/Youtube.svelte';
  import Table from '$lib/components/Table.svelte';
  import Row from '$lib/components/Row.svelte';
  import Nes from '$lib/components/Nes.svelte';

  import atari from './atarijoystick.jpg?w=480&format=webp';
  import gamewatch from './gamewatchdk.jpg?w=480&format=webp';
  import famip2 from './famicomcontroller2.jpg?w=520&format=webp';
  import famiexp from './famicomexpansionport.jpg?w=520&format=webp';
  import famigun from './famicomgun.jpg?w=520&format=webp';
  import nescontroller from './nescontroller.jpg?w=520&format=webp';
  import controllers from './controllers.jpg?w=520&format=webp';
  import controllerpins from './controllerpinout.jpg?w=520&format=webp';
</script>

With the basics of NES graphics covered, let's turn our attention
to reading player input from the controller(s). In this chapter,
we'll look at the history of input devices for the system, how
to read the state of controller buttons, and how to use controller
input to create actual gameplay.

## A History of Controllers

The most successful home console prior to the NES was the Atari
2600 (or "Video Computer System" / VCS).<Margin id="atarijoystick"><img src={atari} alt="" />The Atari 2600 joystick.</Margin> The 2600's controller was a joystick with a single
button, which meant players only had a limited ability to provide
input.

In place of a joystick, the Famicom/NES controllers use a
directional pad (or "D-pad"), shaped like a plus sign. This
setup, invented by Gunpei Yokoi,<Margin id="yokoi"><img src={gamewatch} alt="" />The "Game & Watch Multiscreen" edition of Donkey Kong.<br><br>Yokoi would also go on to produce <em>Kid Icarus</em> and <em>Metroid</em> for the NES, as well as designing the Virtual Boy. His practice of "lateral thinking with withered technology" continues to be the foundation of Nintendo's designs.</Margin> first made an appearance in Nintendo's "Game & Watch Multiscreen" Donkey Kong system in 1982.

<Youtube id="t6HykFfFM1s" title="Japanese commercial for the Game &amp; Watch Dual Screen" />

The Famicom controllers, released only one year later in 1983,
were an evolution of the Multiscreen design. The two controllers
each feature a D-pad, two action buttons (labelled "A" and "B"),
and two supplemental buttons ("Select" and "Start"). On the Famicom,
the controllers are clearly labelled "I" and "II", and player two's
controller features a microphone with its own volume slider.<Margin id="microphone">Why did the Player 2 controller feature a microphone? At the time of the Famicom's release, karaoke had become very popular in Japan.  The microphone would allow developers to create karaoke games for the Famicom, with the player's voice projected through their TV speakers. I'm not aware of any Famicom games that actually used that functionality, and the microphone was dropped when the controllers were revised for the NES. Some Famicom games do use the microphone as a sort of additional input by having the player scream into it at certain points. This functionality has been preserved in Mesen2, which allows you to set a key for microphone input when the Player 2 controller is set to "Famicom controller".</Margin>

<figure>
  <img src={famip2} alt="" />
  <figcaption>A "player 2" controller from the Famicom, featuring microphone controls and a lack of Select and Start buttons.</figcaption>
</figure>

On the Famicom, the two controllers were hard-wired into the console.
To facilitate the addition of future input methods, the Famicom console also
had a front-facing, 15-pin expansion port, normally hidden behind a red
plastic cover. This expansion port was where the Famicom's version of
the "Zapper" light gun connected, as well as multiplayer accessories.

<figure>
  <img src={famiexp} alt="" />
  <figcaption>A close-up picture of the Famicom expansion port. Photo from <a href="https://www.nintendoworldreport.com/feature/27664/nintendos-expansion-ports">NintendoWorldReport</a>.</figcaption>
</figure>

<figure>
  <img src={famigun} alt="" />
  <figcaption>A schematic showing how the Famicom light gun attaches to the console, via the expansion port. The Famicom light gun has a more realistic, "Wild West" revolver style than the comparitively futuristic (and bright orange) US "Zapper" light gun.</figcaption>
</figure>

When the Famicom was re-designed for its US release as the NES, the
controllers underwent some minor, but significant, changes. The microphone
was dropped, making the "Player 1" and "Player 2" controllers identical.
Additionally, the controllers were now detachable, and connected to the
console via a specially-designed plug. This made using alternative controllers
(such as the Zapper) much easier, since players could simply disconnect
a standard controller and plug in something else in its place.

<figure>
  <img src={nescontroller} alt="" />
  <figcaption>The original NES controller.<br>Photo by <a href="https://commons.wikimedia.org/wiki/User:Evan-Amos">Evan Amos</a>.</figcaption>
</figure>

Nintendo (and its hardware partners) created several alternative controllers
over the lifespan of the system. The NES Advantage was an arcade-style
joystick, with the ability to set the A or B buttons to "Turbo" (automatic
rapid button presses when held down), as well as a "slow motion" feature
(in reality, a "Turbo" setting for the start button). The NES Max controller
resembled more modern controller designs, with "wings" for better ergonomics
and a sliding directional pad that looks similar to an analog stick, but
is still digital input. Later controller releases included the NES Satellite
and NES Four Score, each of which allowed four controllers to connect to
the system at the same time and enabled simultaneous four-player gameplay
in games that were coded to take advantage of it.

<figure>
  <img src={controllers} alt="" />
  <figcaption>A collection of non-standard NES controllers. Clockwise, from top left: NES Advantage, NES Max, NES Satellite, NES Four Score.</figcaption>
</figure>

Perhaps the most unusual alternative controller, and the one which likely
did more to cement Nintendo's success in the US than anything else,
was R.O.B., the "Robotic Operating Buddy". Launched as part of the NES
"Deluxe Set" in 1985, R.O.B. was a battery-powered "robot" with photodiodes
for "eyes", which could watch the TV for specially-coded flashes of light
and move in response to them. Only two licensed games were ever released
to take advantage of R.O.B.: _Gyromite_, a pack-in game in the Deluxe Set,
and _Stack-Up_, also released in 1985. While R.O.B. was a failure in terms
of driving development of new games, it was a cool-looking (for the time)
robot that enticed many players/parents to buy the Deluxe Set.

## Controller Hardware

An NES controller has eight inputs: four on the directional pad (Up, Down,
Left, Right), and four actual buttons (Select, Start, A, B). Each input
can be in one of two states: pressed, or not pressed. This sounds like
the perfect opportunity to store controller state in a byte of memory,
with one bit for the state of each button. From an electrical standpoint,
though, sending eight bits of data at a time would require eight wires.
The NES controller connector only has seven pins, making this strategy
impossible.

<figure>
  <img src={controllerpins} alt="" />
  <figcaption>An annotated photo of an NES controller plug. There are seven pins, only three of which are used for data. In general, only one data line is used at a time, with "Data 1" used for standard NES controllers and Data 2 / Data 3 being used by the Zapper.</figcaption>
</figure>

Instead of sending all eight button states in parallel, the NES controller
uses a "parallel-in, serial-out shift register". The controller has
one eight-bit register inside of itself. When the controller receives
a signal from the console on the "Latch" wire, it begins to continuously fill the
register with the current state of the buttons. Turning off the Latch signal
causes the shift register to go back to serial mode, saving the last button
states before the signal was turned off. Then, when the controller receives a
signal on the "Clock" wire, it outputs the state of a single button at a time
(in a specific order) on the appropriate Data wire. So, to read the state of
all buttons on the controller, your code must:

- Send a "1" to the controller latch pin
- Send a "0" to the controller latch pin
- Send eight Clock signals to the controller, and listen for eight bits of data over the Data pin

There are, as you might expect, special memory-mapped I/O addresses for
performing these actions. Memory address `$4016` sets the latch state
for both Controller 1 and Controller 2. Once the controllers' shift
registers are filled, reading from `$4016` will return one bit of
data (one button state) from Controller 1, and reading from `$4017` will return one bit
of data from Controller 2.<Margin id="fourscore">On the NES Satellite or NES Four Score, the first eight reads of `$4016` return the button states for Controller 1, and the next eight reads return the button states for Controller 3. A final set of eight reads returns a "signature" pattern of bits, which allows the game to determine whether or not a four-player adapter is connected to the console. A similar process is used with `$4017` to read the states of Controller 2 and Controller 4.</Margin>

To convert the flow above to assembly code, we first write a "1" to `$4016`,
then write a "0" to the same address.

```ca65
  LDA #$01
  STA $4016
  LDA #$00
  STA $4016
```

(Note: as with other MMIO addresses, it's common to set constant names
for `$4016` and `$4017`. Later, I will use `CONTROLLER1` and `CONTROLLER2`.)

Reads from `$4016` each return a single button state, with bit 0
set if the button is pressed and cleared if it is not (all other bits
are cleared). The button states are returned in this order: A, B, Select,
Start, Up, Down, Left, Right. Storing these eight button states to
eight separate zero-page addresses would be very inefficient, but
thankfully, there is a simple technique that can store
those eight button states in a single byte. In order to use it, though,
we will need to learn a few more 6502 opcodes.

## Bit Shifts and Rotations

A _bit shift_ moves the bits within a byte left or right. The 6502 has
two opcodes that can shift bits: `ASL` (Arithmetic Shift Left) and
`LSR` (Logical Shift Right). `ASL` moves all bits in a byte one position
to the left, dropping the leftmost bit (bit 7) into the carry flag and adding a zero to
replace the now-empty rightmost bit (bit 0). `LSR` does the opposite,
moving all bits in a byte one position to the right, dropping the rightmost
bit into the carry flag and setting the leftmost bit to zero. Because of how binary numbers
work, performing a left shift is the same as multiplying by two (so long as
the result fits within a single byte), and a right shift is the same as
dividing by two and rounding down.

The rotation opcodes (`ROL` "ROtate Left" and `ROR` "ROtate Right") shift bits
just like `ASL` and `LSR`, but rather than filling empty bits with zeroes,
they move whatever is stored in the carry flag into the empty bit position.
When using a rotation opcode, the contents of the carry flag are shifted into
the byte before one of the byte's bits are shifted into the carry flag.

Let's look at a few examples.

```ca65
  ; Our starting byte - equivalent to decimal 15
  LDA #%00001111
  STA $0300

  ; Shift left.
  ASL $0300
  ; Memory address $0300 now contains 00011110,
  ; equivalent to decimal 30.
  ; The carry flag contains 0, because
  ; that was the left-most bit.

  ; Shift back to the right.
  LSR $0300
  ; Memory address $0300 is now back to 00001111.
  ; The carry flag still contains 0.

  ; Shift right again.
  LSR $0300
  ; Memory address $0300 now contains 00000111,
  ; equivalent to decimal 7.
  ; Note that the carry flag is now 1 - when
  ; the rightmost bit was shifted right, it went
  ; into the carry flag.

  ; This time, let's rotate right.
  ROR $0300
  ; Memory address $0300 now contains 10000011,
  ; and the carry flag contains 1 again.
  ; What happened?
  ; The "1" from the carry flag moved into the
  ; leftmost bit position, and the "1" in the
  ; rightmost bit position dropped off into the
  ; carry flag.

  ; Let's do that a few more times:
  ROR $0300
  ; Memory address $0300: 11000001, carry flag: 1
  ROR $0300
  ; Memory address $0300: 11100000, carry flag: 1
  ROR $0300
  ; Memory address $0300: 11110000, carry flag: 0
  ROR $0300
  ; Memory address $0300: 01111000, carry flag: 0

  ; We can also shift or rotate the accumulator directly:
  LDA $0300
  ROL A
  LSR A
  ; The results of the rotate and shift are only in
  ; the accumulator, not stored back into $0300.
```

### Ring Counters

Now that we've looked at shifts and rotations, let's put them
to use to store controller data in a single byte. Remember, asking
for a button state (reading from `$4016`) returns the state of a
button in bit 0, with the bit set if the button is pressed or
cleared if the button is not pressed. A _ring counter_ makes use
of rotations to run a loop exactly eight times, transferring the
results of eight reads from `$4016` into a single byte.

To set up the ring counter, we'll first need a byte of memory to
store our controller data. Since controller data is updated frequently,
a byte of zero-page RAM is ideal.

```ca65
pad1: .res 1
```

Next, we will set the initial state of `pad1` to the byte `00000001`.

```ca65
  LDA #%00000001
  STA pad1
```

Each time we read a button state from the controller, we will use
shift and rotation opcodes to first transfer the bit that represents
the button state into the carry flag, and then rotate it onto `pad1`.
When the "1" from bit 0 rotates all the way left and falls off into
the carry flag, we know that we have transferred eight button states
and we can end the loop (by checking at the end of each loop iteration
against `BCC`, Branch if Carry Clear).

Here's a look at the full code:

```ca65
  ; write a "1", then a "0", to CONTROLLER1 ($4016)
  ; in order to lock in button states
  LDA #$01
  STA CONTROLLER1
  LDA #$00
  STA CONTROLLER1

  ; initialize pad1 to 00000001
  LDA #%00000001
  STA pad1

get_button_states:
  LDA CONTROLLER1       ; Get the next button state
  LSR A                 ; Shift the accumulator right one bit,
                        ; dropping the button state from bit 0
                        ; into the carry flag
  ROL pad1              ; Shift everything in pad1 left one bit,
                        ; moving the carry flag into bit 0
                        ; (because rotation) and bit 7
                        ; of pad1 into the carry flag
  BCC get_button_states ; If the carry flag is still 0,
                        ; continue the loop. If the "1"
                        ; that we started with drops into
                        ; the carry flag, we are done.
```

At the end of this loop, the eight bits of `pad1` will contain
the state of all eight buttons on the controller, as
follows:<Margin id="player2">To capture the state of player 2's controller buttons, use the same ring counter, but substitute `CONTROLLER2` (`$4017`) for `CONTROLLER1`, and designate a second byte of zero-page RAM for storing button states (`pad2`).</Margin>

<Table columns={["Bit", "Button"]}>
  <Row values={["0", "Right"]} />
  <Row values={["1", "Left"]} />
  <Row values={["2", "Down"]} />
  <Row values={["3", "Up"]} />
  <Row values={["4", "Start"]} />
  <Row values={["5", "Select"]} />
  <Row values={["6", "B"]} />
  <Row values={["7", "A"]} />
</Table>

## Using Controller Data

Once you have captured the state of the controller's buttons, the
next step is making use of that data in your game code. To do so,
we can use the logical filters introduced in the last chapter to
test whether or not the buttons we care about are set, and then
branch based on the zero flag. To make that testing easier, I like
to set constants for each button's position in `pad1`:

```ca65
BTN_RIGHT   = %00000001
BTN_LEFT    = %00000010
BTN_DOWN    = %00000100
BTN_UP      = %00001000
BTN_START   = %00010000
BTN_SELECT  = %00100000
BTN_B       = %01000000
BTN_A       = %10000000
```

Once you have these constants, the checks themselves are fairly
simple. Here is how we would test whether or not the start button
is pressed:

```ca65
  LDA pad1      ; Load button states into accumulator
  AND #BTN_START ; Must use "#"! Not a memory address!
  BNE start_pressed ; Branch to code you want to
                    ; run when start is pressed
```

As a quick refresher, `AND` lets you selectively filter out
bits from the accumulator. Any bits that are "0" in `AND`'s
operand will be set to zero in the accumulator; any bits that
are "1" in `AND`'s operand will stay as they are in the
accumulator. By using `00010000` as our operand for `AND`,
we ensure that all bits _except_ the bit that represents
the state of the start button will be zero. That way, if
the start button is not pressed, the result of our `AND`
will be zero, regardless of how many other buttons on the
controller are pressed.

Let's apply this to the game we've been building. Instead of
having the player's ship automatically move left and right,
we will instead read the controller and move the player's
ship appropriately. We already isolated our player-updating
code into its own subroutine (`.proc update_player`), which
should make things a bit simpler. We will need to make the
following changes from the last chapter:

- Read the state of the controller in NMI
- Update our `update_player` subroutine to test for different button presses and move the sprites accordingly

Let's start with reading the controller. We will make a new
subroutine for the ring counter and call it from NMI. First, though,
we will need some new constants in our `constants.inc`:

```ca65 title="constants.inc" showLineNumbers{10}
CONTROLLER1 = $4016
CONTROLLER2 = $4017

BTN_RIGHT   = %00000001
BTN_LEFT    = %00000010
BTN_DOWN    = %00000100
BTN_UP      = %00001000
BTN_START   = %00010000
BTN_SELECT  = %00100000
BTN_B       = %01000000
BTN_A       = %10000000
```

With that out of the way, let's create a new file for controller-related
subroutines. This will make it possible to re-use the same
controller code in multiple projects. Inside the file (I'm calling
it `controllers.asm`), we'll write a subroutine that uses
the ring counter technique we saw earlier:

```ca65 title="controllers.asm" showLineNumbers
.include "constants.inc"

.segment "ZEROPAGE"
.importzp pad1

.segment "CODE"
.export read_controller1
.proc read_controller1
  PHP
  PHA
  TXA
  PHA

  ; write a 1, then a 0, to CONTROLLER1
  ; to latch button states
  LDA #$01
  STA CONTROLLER1
  LDA #$00
  STA CONTROLLER1

  LDA #%00000001
  STA pad1

get_buttons:
  LDA CONTROLLER1 ; Read next button's state
  LSR A           ; Shift button state right, into carry flag
  ROL pad1        ; Rotate button state from carry flag
                  ; onto right side of pad1
                  ; and leftmost 0 of pad1 into carry flag
  BCC get_buttons ; Continue until original "1" is in carry flag

  PLA
  TAX
  PLA
  PLP
  RTS
.endproc
```

One thing to note is the `.importzp pad1` on line 4 - we will
need to make sure that we reserve a byte in zero-page with that
name and export it with `.exportzp`. Here is the updated
`ZEROPAGE` segment in our main file (now called 
`input.asm`):<Margin id="no_player_dir">I've also removed the <code>player_dir</code> byte; it was only needed because we were continually moving the player's ship either left or right. Since we don't need to track that anymore, we've freed up another byte of zero-page RAM.</Margin>

```ca65 title="input.asm" showLineNumbers{4}
.segment "ZEROPAGE"
player_x: .res 1
player_y: .res 1
scroll: .res 1
ppuctrl_settings: .res 1
pad1: .res 1
.exportzp player_x, player_y, pad1
```

We have a fair number of things that we are keeping track of,
but we are only using five of the 256 zero-page
addresses available to us. Even so, it's still important to use
zero-page only for things that will be updating frequently,
since later additions like audio or tracking a large number of
enemies can take up a big chunk of zero-page addresses.

Next, let's update the NMI handler to read controller state
once per frame:

```ca65
.import read_controller1

.proc nmi_handler
  ; standard start-of-NMI code not shown

  ; read controller
  JSR read_controller1
```

Remember that you need to import any subroutines you want
to use that are exported in a different file.

Everything is in place to work with controller data. Now, it's
time to update the `update_player`
subroutine.<Margin id="boundary_homework">While virtually all of this subroutine will be replaced, a portion of it that might still be useful is the code to detect collisions with the edge of the screen. To keep the logic simpler, this chapter will only focus on using controller input, but it's a good homework exercise to re-implement bounds checking on your own, essentially ignoring controller presses that would put the ship outside of a certain area.</Margin> Our logic for updating the player position will work as follows
(the exact order of checking directions is arbitrary):

- Check if the player pressed Left. If so, decrement `player_x`.
- Check if the player pressed Right. If so, increment `player_x`.
- Check if the player pressed Up. If so, decrement `player_y`.
- Check if the player pressed Down. If so, increment `player_y`.

This setup gives us a one-to-one mapping between controller presses
and movement on screen, which will have a "stiff" feel. In a
later chapter, we'll add rudimentary physics, but this simpler
approach will let us focus on the controller.

The updated `update_player` subroutine is as follows:

```ca65
.proc update_player
  LDA pad1        ; Load button presses
  AND #BTN_LEFT   ; Filter out all but Left
  BEQ check_right ; If result is zero, left not pressed
  DEC player_x  ; If the branch is not taken, move player left
check_right:
  LDA pad1
  AND #BTN_RIGHT
  BEQ check_up
  INC player_x
check_up:
  LDA pad1
  AND #BTN_UP
  BEQ check_down
  DEC player_y
check_down:
  LDA pad1
  AND #BTN_DOWN
  BEQ done_checking
  INC player_y
done_checking:
  RTS
.endproc
```

That rounds out the updates to the code. Let's build
everything and verify that it works as expected, by
running the following commands in the top-level
directory for the project.

```shell
ca65 src/backgrounds.asm
ca65 src/controllers.asm
ca65 src/reset.asm
ca65 src/input.asm
ld65 src/backgrounds.o src/controllers.o src/input.o src/reset.o -C nes.cfg -o input.nes
```

The resulting .nes file should let you move the player
ship freely using whatever your emulator has mapped to
the D-pad inputs. Here it is running in an emulator in
your browser! The emulator supports keyboard shortcuts,
using the following keys
(for QWERTY keyboards). You will need to first click on
the emulator area or otherwise focus it in order for
keypresses to be registered.

<Table columns={["Controller", "Keyboard"]}>
  <Row values={["Right", "Right"]} />
  <Row values={["Left", "Left"]} />
  <Row values={["Down", "Down"]} />
  <Row values={["Up", "Up"]} />
  <Row values={["Start", "Enter"]} />
  <Row values={["Select", "Tab"]} />
  <Row values={["B", "s"]} />
  <Row values={["A", "a"]} />
</Table>

<Nes rom="/roms/input.nes" />

## Homework

Here are some exercises to try now that we have covered
the basics of controller input. You can download
[the code from this chapter](https://famicom.party/book/projects/16-input.zip)
as a starting point.

- Using the code from [Chapter 14](https://famicom.party/book/14-spritemovement) as a guide, make it so the player's ship cannot wrap around the screen. When the ship approaches an edge, ignore controller input that would move it off screen.
- Make it so the ship responds differently when multiple buttons are pressed at the same time. As an example, holding "B" while pressing a direction could make the player's ship move twice as fast as normal.
- Let the player "pause" the game. When Start is pressed, stop scrolling the screen and ignore controller directional movement. When Start is pressed again, resume scrolling and listening to inputs.
