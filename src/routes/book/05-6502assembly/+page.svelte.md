---
title: 5. Introducing 6502 Assembly
prev:
  url: 04-hardwareoverview
  title: 4. NES Hardware
next:
  url: 06-headersinterruptvectors
  title: 6. Headers and Interrupt Vectors
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Table from '$lib/components/Table.svelte';
  import Row from '$lib/components/Row.svelte';
  import palette from './NES_color_palette_with_numbers.png?width=600&format=webp';
</script>

The "Hello World" program you created in Chapter 3 is probably unlike any other you have ever seen:
44 lines of code, mostly composed of three-letter acronyms and numbers, just to
change the color of the screen. What did you copy and paste?

As you can probably guess from the title of this chapter, helloworld.asm contained
_assembly_ code.<Margin id="asm-file-extension">I prefer to use the `.asm` extension for assembly files, but the choice is pretty arbitrary. Some developers prefer to use `.s` for their assembly files. Ultimately, the choice is yours - ca65 will assemble any file extension as long as the contents are assembly code.</Margin> Assembly is one layer of abstraction above machine code. Writing assembly requires detailed knowledge of a processor's instruction set, but it is far more readable than machine code's stream of bytes. Let's look at some example assembly code to see how it works:

```ca65 showLineNumbers
.proc main
  LDX PPUSTATUS
  LDX #$3f
  STX PPUADDR
  LDX #$00
  STX PPUADDR

copy_palettes:
  LDA palettes,x
  STA PPUDATA
  INX
  CPX #$20  ; 32 colors total
  BNE copy_palettes
```

### Separation of instructions and data

The three-letter words in all caps on lines 2-6 and 9-13 are called _opcodes_.
Each one represents an instruction from the processor's instruction set, but instead
of referring to them by number, they now have names. `LDA`, for example, means "load
accumulator". We'll be learning a few dozen opcodes over the course of this book; there
are 56 "official" 6502 assembly opcodes in total.

Having instructions represented with short "words" means that we can now distinguish
between instructions and data visually, instead of having to work through the code
byte-by-byte. Anything to the right of an opcode is data that goes with that instruction.
We call data for an instruction an _operand_. On line 3, for example,
`LDX #$3f` is an instruction to "load the X register with the hex value $3f".
`LDX` is the opcode, and `#$3f` is the operand.<Margin id="opcode-letter-case">Here, and throughout this book, I will be presenting opcodes in all-caps, but this is a personal choice. The assembler will accept lowercase opcodes as well, and some developers prefer lowercase. The same applies to operand values - `$3f` can also be written as `$3F`.</Margin>

### Constants and labels

While the separation of instructions and data is incredibly useful, assembly gives us
several other tools as well. The operands on lines 2, 4, 6, and 10, in all-caps, are
_constants_ defined elsewhere. When the assembler (ca65) is run, it will replace
the name of the constant (e.g. `PPUSTATUS`) with its value (e.g. `$2002`).
You can make a constant by using the equal sign: `PPUSTATUS = $2002`.

Assembly also lets us set _labels_ - named places in our code that can be referenced later.
On line 8, a new label, `copy_palettes`, is defined. What makes a label a label is the
colon (:) that it is followed by. On line 13, the label is used as an operand to the `BNE`
opcode. We'll talk about the specifics of how it works later, but line 13 is essentially repeating
the code from lines 8-13 again. When the assembler is run, it replaces labels in your assembly
code with actual memory addresses in the machine code output.

### Comments

You can add _comments_ to your assembly code using the semicolon (;) character. Anything from the
semicolon to the end of the line is treated as a comment and will be stripped out when you
run your code through an assembler. Comments are useful for reminding yourself what a certain
piece of code is meant to do. In our example code above, you can see a comment on line 12.

### Assembler directives

Finally, assembly code gives us _directives_ - instructions for the assembler that affect
the conversion from assembly to machine code, rather than instructions for the processor where
the machine code will be executed. Directives start with a period (.). The example code uses
the `.proc` directive on line 1 to indicate a new lexical scope (more on that later).
Another common directive is `.byte`, which indicates that the following bytes should
be copied raw into the machine code output rather than trying to process them as opcodes or operands.

## Your First Opcodes: Data Movement

Now that we have seen what 6502 assembly looks like, let's start learning it! I have broken out
the opcodes that you will learn over the course of the book into seven major groups. The first
group comprises instructions that move data between registers and memory.


### Loading data: `LDA`, `LDX`, `LDY`

The "LD" commands load data into a register. As a reminder, the 6502 has three registers to
work with: "A" or "accumulator", which can do math, and "X" and "Y", the "index registers".
`LDA` loads data into the accumulator, `LDX` loads data into the X
register, and `LDY` loads data into the Y register.


There are two main sources for this data: loading from a memory address and loading a given
value. Which source is used is based on how you write the operand for the opcode. If you
use a 16-bit value (four hex digits), it will load the contents of that memory address.
If you use a hash sign (#) followed by an 8-bit value (two hex digits), it will load the
exact value you used. Here is an example:

```ca65
  LDA $3f00  ; load contents of memory address $3f00
             ; into the accumulator
  LDA #$3f   ; load the value $3f into the accumulator
```

These different operand formats are called _addressing modes_. The 6502 can use
eleven different addressing modes (though most opcodes are limited to a subset of
them).<Margin id="addressing-modes">In case you're curious, the eleven addressing modes are Accumulator, Immediate, Implied, Relative, Absolute, Zeropage, Indirect, Absolute Indexed, Zeropage Indexed, Indexed Indirect, and Indirect Indexed.</Margin> The two modes we've just seen are _absolute_ mode (providing a memory address) and _immediate_ mode (providing an exact value). We will learn more addressing modes as needed over the course of the book.

When your code is run through the assembler, the different addressing modes actually translate
to different entries in the instruction set. `LDA $3f00` becomes `ad 00 3f`.
In the 6502 instruction set, `ad` is the instruction set number of the "LDA absolute mode" instruction,
and $3f00 is placed in little-endian order. `LDA #$3f`, though, becomes `a9 3f`. Here, `a9` is
the instruction set number for "LDA immediate mode". The assembler is smart enough to insert
the correct instruction set number based on how you write the operand, so you don't need to worry
about _which_ `LDA` instruction you need to use.

### Storing data: `STA`, `STX`, `STY`

The "ST" opcodes do the reverse of the "LD" opcodes - they store the contents of a register to
a memory address. STA stores the contents of the accumulator to the location specified by its
operand, STX stores the contents of the X register, and STY stores the contents of the Y register.
The ST instructions cannot use immediate mode, since it doesn't make sense to store the contents
of a register into a literal number. After a store operation, the register you stored from keeps
its same value, allowing you to store the same register value in a different location right away.

### Transferring data: `TAX`, `TAY`, `TXA`, `TYA`

Finally, the "T" instructions transfer data from one register to another. These opcodes are all
read as "transfer from register to register" - `TAX`, for example, is "transfer from accumulator to
X register". The "transfer" in these instructions is more accurately described as a "copy", since
after one of these instructions, both registers will have the value of the first register.

### A small example

Now that you've learned your first ten opcodes (and two addressing modes), let's look at a small
example that makes use of them.

```ca65
  LDA #$a7
  TAY
  STY $3f00
```

What does this code do? Let's take it line-by-line:

1. First, we load the value `$a7` into the accumulator. `LDA` is the opcode that loads
  data into the accumulator. The `#` in front of `$a7` indicates that we want to
  use immediate mode, so this is a number to put directly into the accumulator, not a memory
  address.
2. Next, we copy the value `$a7` from the accumulator to the Y register. Now both A and Y have
  the same value.
3. Finally, we store the value of the Y register (`$a7`) at memory address `$3f00`.

## Back to the Test Project

You now understand enough assembly to work out what most of the test project is doing. Let's
look specifically at the `main` portion, reproduced here:

```ca65 showLineNumbers{34}
.proc main
  LDX $2002
  LDX #$3f
  STX $2006
  LDX #$00
  STX $2006
  LDA #$29
  STA $2007
  LDA #%00011110
  STA $2001
forever:
  JMP forever
.endproc
```

Most of this code is made up of loads and stores. The memory addresses that we load from
or store to are `$2001`, `$2002`, `$2006`, and `$2007`.
The immediate-mode values that we load are `$3f`, `$00`, `$29`,
and `%00011110` (a binary value, unlike the hex values we use everywhere else).

Looking more closely at the immediate-mode loads, notice that the first two are `$3f00`,
the address in PPU memory where palettes begin, followed by `$29`, the green color that
we are using in the background. This code is telling the PPU to store `$29` at address
`$3f00`, but how?

### Memory-Mapped I/O

On the NES, addresses in the `$2000`-`$6000` range are reserved for use as
_memory-mapped I/O_ (or "MMIO") addresses. "I/O" is "input/output" - sending data between different devices.
"Memory-mapped" means that these interfaces to other devices are mapped to memory addresses - in
other words, certain memory addresses are not memory at all, but rather connections to other
devices.

Memory addresses in the low `$2000`s correspond to connections to the
PPU.<Margin id="nesdev-reference">If you want to learn more about the PPU's MMIO addresses (or any other NES topic, for that matter), check out the <a href="http://wiki.nesdev.com/w/index.php/PPU_registers">NESDev Wiki</a>. While it is not the best resource to <em>learn</em> from, it is an invaluable reference to the system, backed by meticulous research from its contributors.</Margin> There are four MMIO addresses in use in our code; let's take a look at what each one does (along with the name each address is commonly known by).

### `$2006`: PPUADDR and `$2007`: PPUDATA

The NES CPU (where your code is being executed) doesn't have direct access to the PPU's memory. Instead,
CPU memory address `$2006` lets your code select an address in PPU memory, and `$2007`
lets your code write a byte of data to that address. To set the address you want to write to, store two
bytes of data to `$2006` - first the "high" (left) byte, followed by the "low" (right) byte. Here's how
our test project does that:

```ca65 showLineNumbers{36}
  LDX #$3f
  STX $2006
  LDX #$00
  STX $2006
```

This code first stores the byte `$3f` to `$2006`, then the byte `$00`
to `$2006` - in other words, it sets the address for any following writes to PPU memory to
`$3f00`, which is the address of the first color of the first palette.

To store data at the selected PPU memory address, store a byte to `$2007`:

```ca65 showLineNumbers{40}
  LDA #$29
  STA $2007
```

This writes the byte `$29` (which represents "green") to the memory address we selected
before (`$3f00`). Each time you store a byte to PPUDATA, the memory address for the
next store is incremented by one. If the next lines of code in the program were `LDA #$21`
and `STA $2007`, the byte `$21` would be written to PPU address `$3f01`
even though we did not do anything with PPUADDR.

### `$2002`: PPUSTATUS

PPUSTATUS is a read-only MMIO address. When you load from `$2002`, the resulting byte
gives you information about what the PPU is currently doing. Reading from PPUSTATUS has one useful
side-effect, as well: it resets the "address latch" for PPUADDR. It takes two writes to PPUADDR
to fully specify a memory address, and it is possible that your code might make one write
but never get around to doing the second write. Reading from PPUSTATUS makes it so that the
next write to PPUADDR will always be considered a "high" byte of an address.

In our test project, we read ("load") from PPUSTATUS before attempting to write an address to PPUADDR:<Margin id="writing-to-ppu">This process - reading from PPUSTATUS, writing two bytes to PPUADDR, and writing bytes to PPUDATA - is something that we will be using <em>all the time</em>. Anything that changes what is displayed to the screen uses this process to tell the PPU what to draw, and virtually everything in a game is going to change what is displayed to the screen. Learning this process well now will be very useful to you in future chapters.</Margin>

```ca65 showLineNumbers{35}
  LDX $2002
  LDX #$3f
  STX $2006
  LDX #$00
  STX $2006
  LDA #$29
  STA $2007
```

### `$2001`: PPUMASK

There's still one more thing our test project has to do after it tells the PPU to use color `$29`
as the first color of the first palette - it has to tell the PPU to actually start drawing things to the screen!
PPUMASK allows your code to give the PPU instructions about what to draw, as well as set some tweaks to how
colors are displayed. The byte that you store to PPUMASK is a set of eight _bit flags_, where each
bit in the byte acts as an on/off switch for a particular property. Here is what each bit does. (Remember,
the bits that make up a byte are numbered 0-7, with bit 0 all the way on the right, and bit 7 all the way
on the left.)

<Table columns={["Bit #", "Effect"]}>
  <Row values={["0", "Greyscale mode enable (0: normal color, 1: greyscale)"]} />
  <Row values={["1", "Left edge (8px) background enable (0: hide, 1: show)"]} />
  <Row values={["2", "Left edge (8px) foreground enable (0: hide, 1: show)"]} />
  <Row values={["3", "Background enable"]} />
  <Row values={["4", "Foreground enable"]} />
  <Row values={["5", "Emphasize red"]} />
  <Row values={["6", "Emphasize green"]} />
  <Row values={["7", "Emphasize blue"]} />
</Table>

Before we look at the test project, a few notes on these options. Bits 1 and 2
enable or disable the display of graphical elements in the left-most eight pixels
of the screen. Some games choose to disable these to help avoid flicker during
scrolling, which we will learn more about later. Bits 5, 6, and 7 allow your
code to "emphasize" certain colors - making one of red, green, or blue brighter
and making the other two colors darker. Using one of the emphasis bits essentially
applies a color tint to the screen. Using all three at the same time makes the
entire screen _darker_, which many games use as a way to create a transition
from one area to another.

Let's look again at our test project's code. What value does our test project write
to PPUMASK?

```ca65 showLineNumbers{42}
  LDA #%00011110
  STA $2001
```

Here is what options we are setting, bit-by-bit:

<Table columns={["Bit #", "Value", "Effect"]}>
  <Row values={["0", "0", "Greyscale mode disabled"]} />
  <Row values={["1", "1", "Show leftmost 8px of background"]} />
  <Row values={["2", "1", "Show leftmost 8px of foreground"]} />
  <Row values={["3", "1", "Background enabled"]} />
  <Row values={["4", "1", "Foreground enabled"]} />
  <Row values={["5", "0", "No red emphasis"]} />
  <Row values={["6", "0", "No green emphasis"]} />
  <Row values={["7", "0", "No blue emphasis"]} />
</Table>

Since our test project turns on background rendering in its write to
PPUMASK, our green background shows up after this line.

## Wrapping Up the `main` Code

Our test project has written a color to PPU memory and turned on
display rendering, so it's all done, right?

Not so fast. Remember, the CPU fetches and executes instructions one at a time,
continuously. Unless we write code to keep the processor busy, it will
continue reading (empty) memory and "executing" it, which could lead to
disastrous results. Thankfully, there's an easy solution to this problem:

```ca65 showLineNumbers{44}
forever:
  JMP forever
```

We will learn the details of how this works later, but essentially these two lines
of code create a _label_ (`forever`), and then tell the CPU
to fetch that label as the next instruction to execute. The CPU goes into an
infinite loop, and your project happily does nothing but display its green background.

We've now covered everything in `main` (though we still haven't talked about
what `.proc` and `.endproc` are doing), but there's much
more in the test project to discuss. Next, we will learn about interrupt vectors
and how our code initializes the NES when it first powers on.

## Homework

Now that you know how the test project sets a background color, try modifying it
to display a different color. I've included the color chart from Chapter 4 below.
Don't forget to re-assemble and re-link your code before opening it in Mesen2.

<figure>
  <img src={palette} alt="" />
  <figcaption>The NES color palette.</figcaption>
</figure>
