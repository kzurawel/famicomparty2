---
title: 6. Headers and Interrupt Vectors
prev:
  url: 05-6502assembly
  title: 5. Introducing 6502 Assembly
next:
  url: 07-whydothis
  title: 7. Why Would Anyone Do This?
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Table from '$lib/components/Table.svelte';
  import Row from '$lib/components/Row.svelte';
</script>

Last chapter, we covered the "main" section of the test project, which sets the background color
and then goes into an infinite loop. Yet that code only accounts for 13 lines out of the 44-line
test project source code. In this chapter, we'll explore the remainder of the test project's source
code and learn a few more opcodes.

## iNES Headers

At the very beginning of the test project, we see this curious bit of assembly:

```ca65 showLineNumbers
.segment "HEADER"
.byte $4e, $45, $53, $1a, $02, $01, $00, $00
```

`.segment`, since it begins with a period, is an assembler directive - an instruction
for the assembler to follow when it is converting the code to machine code. `.segment`,
as we discussed in Chapter 4, tells the assembler where to put your code in the final output. The
`HEADER` segment, unsurprisingly, is placed at the very beginning of the resulting .nes
file.

The second line uses another assembler directive that we've seen before. `.byte` tells the
assembler to insert literal data bytes into the output, rather than trying to interpret opcodes
from them. The three ASCII codepoints `$4e`, `$45`, `$53` are the string "NES"
(the ASCII representations of "N", "E", and "S"). The next byte, `$1a`, represents the MS-DOS
"end of file" character. These four bytes
are a "magic number" that marks the output as an NES game.<Margin id="magic-numbers">Most file types have a "magic number" at the start of the file to make it easier for an operating system to know what a file is with certainty. Java bytecode files begin with `$cafebabe`, PDF files begin with `$25504446` ("%PDF"), and zip files begin with `$504b` ("PK", since the format used to be called "PKZIP"). You can find a larger list of file type magic numbers on [Wikipedia](https://en.wikipedia.org/wiki/Magic_number_%28programming%29#Format_indicator).</Margin>

The "NES" magic number header specifically identifies the file as an "iNES" NES game.
[iNES](http://fms.komkon.org/iNES/) was one of the first NES emulators, and the first to
achieve widespread popularity. iNES' author, Marat Fayzullin, created a special header format that
provides the emulator with information about the game itself, such as which region (NTSC/PAL) the
game is from, how many PRG and CHR ROM banks it has, and more. The full iNES header is 16 bytes long.

Our test project's header, after "NES" and `$1a`, specifies that the "cartridge" for our
game contains two 16KB PRG-ROM banks (32KB storage) and one 8KB CHR-ROM bank, and that it uses
"mapper zero". NES cartridges come in many (hundreds) of variations, and the iNES header assigns
each variant a number. Mapper zero, as you might guess, represents the simplest kind of NES cartridge,
generally called "NROM". Some of the earliest NES games used NROM cartridges, including _Balloon Fight_,
_Donkey Kong_, and _Super Mario Bros._. Due to their relative simplicity, we'll be creating
NROM cartridge games for most of this book.<Margin id="ines-header-details">For more details on the iNES header format, see the article on the [NESDev Wiki](http://wiki.nesdev.com/w/index.php/INES). Many of the things that can be set through the iNES header, like mirroring modes and PRG-RAM, will be discussed in greater detail later in this book.</Margin>

## Isolating Procedures with `.proc`

After the header, another `.segment` directive switches us to the "CODE" segment,
which begins at 16 bytes into the file (i.e., after the 16-byte header). The first thing
within the segment is a new assembler directive, `.proc`. This directive lets you
create new lexical scopes in your code. Basically, this means that the labels you make
inside of a `.proc` are unique to that proc. Here's an example:

```ca65
.proc foo
  LDA $2002
some_label:
  LDA #$3f
.endproc

.proc bar
  LDA #$29
some_label:
  STA $2007
.endproc
```

Here, we use the label `some_label` twice, once in `.proc foo` and once
in `.proc bar`. However, since they are inside of different procs, the two labels
are treated as totally separate. Using `some_label` inside of `bar` will
refer to `bar`'s version, and there is no way to access `foo`'s version
of the label from inside of `bar`. Generally, we will wrap independent pieces of
code in their own procs so they can use the same label names without clobbering each
other.<Margin id="why-use-procs">This might seem like a lot of effort just to be able to use the same label name in more than one place, which is true to an extent. The real power of using `.proc` comes when your code is composed of multiple files - some of which you might not have written yourself! Procs let you safely use a label without having to check through all of the code to see if you (or another developer) have used the same label before.</Margin>

The test project uses four procs - `irq_handler`, `nmi_handler`,
`reset_handler`, and `main`. We covered the `main` proc
in the last chapter, but what are the other procs doing?

## Interrupt Vectors

As discussed earlier, the processor in the NES repeatedly fetches and executes bytes
in sequence. When certain events happen, though, we want to interrupt the processor
and tell it to do something else. The events that can cause these interruptions are
called _interrupt vectors_, and the NES/6502 has three of them:

- The _reset vector_ occurs when the system is first turned on, or when the user
  presses the Reset button on the front of the console.
- The _NMI vector_ ("Non-Maskable Interrupt") occurs when the PPU starts preparing
  the next frame of graphics, 60 times per second.
- The _IRQ vector_ ("Interrupt Request") can be triggered by the NES' sound processor
  or from certain types of cartridge hardware.

When an interrupt is triggered, the processor stops whatever it is doing and executes
the code specified as the "handler" for that interrupt. A handler is just a collection
of assembly code that ends with a new opcode: `RTI`, for "Return from Interrupt".
Since the test project doesn't need to make use of NMI or IRQ handlers, they consist of
just `RTI`:

```ca65 showLineNumbers{5}
.proc irq_handler
  RTI
.endproc

.proc nmi_handler
  RTI
.endproc
```

`RTI` marks the end of an interrupt handler, but how does the processor
know where the handler for a given interrupt begins? The processor looks to the last
six bytes of memory - addresses `$fffa` to `$ffff` - to find
the memory address of where each handler begins.

<Table columns={["Memory address", "Use"]}>
  <Row values={["$fffa-$fffb", "Start of NMI handler"]} />
  <Row values={["$fffc-$fffd", "Start of reset handler"]} />
  <Row values={["$fffe-$ffff", "Start of IRQ handler"]} />
</Table>

Because these six bytes of memory are so important, ca65 has a specific segment type
for them: `.segment "VECTORS"`. The most common way to use this segment
is to give it a list of three labels, which ca65 will convert to addresses when
assembling your code. Here is what our test project's "VECTORS" segment looks like:

```ca65 showLineNumbers{39}
.segment "VECTORS"
.addr nmi_handler, reset_handler, irq_handler
```

`.addr` is a new assembler directive. Given a label, it outputs the memory
address that corresponds to that label. So, these two lines of assembly set bytes
`$fffa` to `$ffff` of memory to the addresses of the NMI handler,
reset handler, and IRQ handler - exactly the same order as in the table above. Each
label on line 40 is the start of the `.proc` for that handler.<Margin id="turning-it-on">When the NES first turns on, rather than starting from memory address `$0000`, the 2A03 follows a specific series of steps. It fetches the memory address stored in `$fffc` and `$fffd` (the address of the start of the reset handler).  It places that address into the program counter, which makes the start of the reset handler the next instruction to be executed. Then it works its way through the reset handler, instruction by instruction.</Margin>

### The Reset Handler

While the test project doesn't make use of the NMI or IRQ events, it does need a reset
handler. The reset handler's job is to set up the system when it is first turned on,
and to put it back to that just-turned-on state when the user hits the reset button.
Here is the test project's reset handler:

```ca65 showLineNumbers{13}
.proc reset_handler
  SEI
  CLD
  LDX #$40
  STX $4017
  LDX #$FF
  TXS
  INX
  STX $2000
  STX $2001
  STX $4010
  BIT $2002
vblankwait:
  BIT $2002
  BPL vblankwait
vblankwait2:
  BIT $2002
  BPL vblankwait2
  JMP main
.endproc
```

A few things to note about this section of code. First, unlike the other interrupt handlers, it
does not end in `RTI` - that's because when the system is first turned on,
the processor wasn't in the middle of doing anything else, so there is nowhere to "return"
to. Instead, it ends with `JMP main`. We saw `JMP` at the end of `main`
last chapter, where `JMP forever` created our infinite loop. `JMP`
stands for "jump", and it tells the processor to go somewhere else to fetch its next instruction.
The operand for `JMP` is a full, two-byte memory address, but it is nearly always
used with a label that the assembler will convert to a memory address at assemble time.
`JMP main`, here, tells the processor to start
executing the code in `main` once it is done with the reset handler.

Second, this code features several opcodes we haven't seen before. Let's learn about them by
analyzing the reset handler line-by-line.

Lines 14 and 15 feature two opcodes that are, generally, only found in reset handlers.
`SEI` is "Set Interrupt ignore bit". After an `SEI`, anything
that would trigger an IRQ event does nothing instead. Our reset handler calls `SEI`
before doing anything else because we don't want our code to jump to the IRQ handler
before it has finished initializing the system. `CLD` stands for "Clear Decimal mode bit",
disabling "binary-coded decimal" mode on the 6502.<Margin id="bcd-mode">Due to convoluted licensing issues surrounding the 6502 and Ricoh's legal ability to manufacture it, the 2A03 used in the NES has binary-coded decimal mode circuitry within it, but all electrical traces that would connect those circuits to the rest of the chip have been cut. `CLD` (and its counterpart, `SED`) do nothing on the NES as a result, but calling `CLD` as part of a reset handler just-in-case is considered best practice.</Margin>

The next four lines disable audio IRQs (which are handled separately from the `SEI` we used earlier) and set up the "stack". I'm not going to go into detail on these yet; this reset code is something that you will likely copy verbatim into each project, so it's not something you will need to change on your own. I'll cover both of these much later.

The next three lines (after `INX`) go back to familiar loads and stores. We've seen `$2001` before -
it's PPUMASK - but `$2000` is new. This address is commonly referred to as PPUCTRL, and
it changes the operation of the PPU in ways more complicated than PPUMASK's ability to
turn rendering on or off. We won't cover PPUCTRL in detail until later in this book, when
we've seen more of how the NES PPU draws graphics. Like PPUMASK, it is a set of bit fields.
For the purpose of initializing the NES, the main thing to point out is that bit 7 controls
whether or not the PPU will trigger an NMI every frame. After the `INX` opcode, the X register
holds a value of `$00`. By storing `$00` to both
PPUCTRL and PPUMASK, we turn off NMIs and disable rendering to the screen during startup, to
ensure that we don't draw random garbage to the screen. Writing `$00` to `$4010` turns off
DMC IRQs; this is another part of the audio processing unit (APU) which will be covered much later.
For now, just know that doing this in your reset handler helps prevent difficult-to-debug glitches
in your projects.

The remainder of the reset handler is a loop that waits for the PPU to fully boot up before
moving on to our main code. The PPU takes about 30,000 CPU cycles to become stable from
first powering on, so this code repeatedly fetches the PPU's status from PPUSTATUS (`$2002`)
until it reports that it is ready. 30,000 cycles sounds like a long time, but the NES' 2A03 processor
runs at 1.78 MHz, so 30,000 cycles is a tiny, tiny fraction of a second. I'm not going to cover
`BIT` or `BPL` here, but rest assured that we will come back to them later.

Finally, with all of our setup complete, we jump to `.proc main` and execute
our game's actual code.

### A Full Reset

The reset handler our test project uses is the most basic handler that will reliably start up
the NES in a known-good state. There are many other tasks that the reset handler can take
care of, like clearing out RAM. As we add more functionality to our games, we will expand
the role of the reset handler as well.

We have now covered all of the code from the test project - congratulations! After the last few
chapters, you might be thinking to yourself "this is incredibly complicated, why bother?"
The next chapter is for you!
