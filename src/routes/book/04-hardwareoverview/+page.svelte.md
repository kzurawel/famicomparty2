---
title: 4. NES Hardware
prev:
  url: 03-gettingstarted
  title: 3. Getting Started
next:
  url: 05-6502assembly
  title: 5. Introducing 6502 Assembly
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import mobo from './NES-Mk1-Motherboard-Top.jpg?w=600&format=webp';
  import cpu2a03 from './2a03.jpg?w=600&format=webp';
  import ppu2c02 from './2c02.jpg?w=600&format=webp';
  import cart from './Tetris-Cartridge-Board.jpg?w=600&format=webp';
  import inconsole from './cartridge-in-console.jpg?w=600&format=webp';
  import palette from './NES_color_palette.png?w=600&format=webp';
  import smbpalettes from './SMB_palettes.png?w=600&format=webp';
  import palwithnums from './NES_color_palette_with_numbers.png?w=600&format=webp';
</script>

Before we look at assembly, let's start with an overview of the NES itself.

## The Console

If you were to open up an NES console and take a look at its insides, you would
see something like this:

<figure>
  <img src={mobo} alt="" />
  <figcaption>An NTSC (US/Japan) NES motherboard. Photo by Evan Amos.</figcaption>
</figure>

Visually, the NES motherboard is dominated by the (unused) expansion slot
at the top and two large chips. On the left side is this chip,
labelled "RP2A03":

<figure>
  <img src={cpu2a03} alt="" />
  <figcaption>The Ricoh 2A03 CPU/APU.</figcaption>
</figure>

And on the right side is this other chip, labelled "RP2C02":

<figure>
  <img src={ppu2c02} alt="" />
  <figcaption>The Ricoh 2C02 PPU.</figcaption>
</figure>

Together, these two chips provide all of the NES' processing power. The first chip,
the 2A03, is the NES' CPU - "central processing unit". The 2A03 is based on
the MOS Technologies 6502 processor, with a few special tweaks by its producer,
Ricoh.<Margin id="ricoh-6502-license"> When I say the 2A03 is "based on" the 6502, there was really only one major difference between the two: the 2A03 lacks support for a feature in the 6502 called "binary coded decimal" (BCD) mode. BCD allows the binary numbers the CPU works with to act like decimal numbers when adding or subtracting. The BCD circuitry in the 6502 was covered by a separate licensing agreement that Ricoh was not party to, so Ricoh could not legally include BCD mode in its processors even though it had full schematics of how the mode was implemented in silicon.  To get around this issue, Ricoh fabricated a "full" 6502 but cut all electrical connections between the BCD portion of the chip and the rest of the processor.</Margin> Ricoh also included within the 2A03 a full APU - "audio processing unit" - that handles music and sound effects.

The second chip, the 2C02, is the NES' PPU - "picture processing unit" -, what you
might think of nowadays as a "graphics card". The PPU receives instructions from
the CPU and translates them into output for the screen. The CPU knows nothing about
how televisions work; it leaves all of that processing to the PPU.

## Cartridges

NES games are distributed via plastic cartridges (or "Game Paks", as Nintendo called
them in the US). Inside each cartridge is a small circuit board that looks something
like this:

<figure>
  <img src={cart} alt="" />
  <figcaption>The cartridge circuit board for <em>Tetris</em>. Photo by Evan Amos.</figcaption>
</figure>

Much like the console motherboard, cartridge circuit boards are dominated by two
large chips. The left-side chip is labelled "PRG", and the right-side chip is labelled "CHR".
PRG-ROM is "program ROM", and it contains all of the game's code (machine code). CHR-ROM is
"character ROM", which holds all of the game's graphics data.<Margin id="additional-chips">There are two additional chips on this board. To the right of the two main ROMs is the "CIC" (Checking Integrated Circuit) or "<a href="https://en.wikipedia.org/wiki/CIC_\(Nintendo\)">lockout</a>" chip, an attempt to ensure that only Nintendo-produced cartridges would work in an NES. (The CIC chip is also the reason why your NES games often flicker repeatedly until you take them out and put them back in, hopefully <em>without</em> blowing on the contacts first.) Under the two ROM chips is the "MMC1", a memory management controller which we will cover in detail much later in this book.</Margin>


These two ROM chips have their pins connected to a series of gold connectors at the edge of the cartridge board. When the cartridge is inserted into the console's cartridge slot, the gold connectors make electrical contact with an identical set of connectors in the console. The result is that the PRG-ROM is electrically wired directly to the 2A03 CPU, and the CHR-ROM is wired directly to the 2C02 PPU.

<figure>
  <img src={inconsole} alt="" />
  <figcaption>A diagram showing how the cartridge's ROM chips connect to the console's processors.</figcaption>
</figure>

## What does this have to do with the test project?

If you look back at the test project's assembly source, you'll notice several lines that start with
`.segment`. These are _assembler directives_ - something we'll explore in the
next chapter - that dictate where in the finished ROM file certain pieces of code should go.

```ca65
.segment "HEADER"
.segment "CODE"
.segment "VECTORS"
.segment "CHARS"
.segment "STARTUP"
```

Two of these segments are not part of the game's code per se.
The `STARTUP` segment doesn't actually do anything; it's needed for C code compiled
down to 6502 assembly, but we won't be using it. The `HEADER` segment contains
information for emulators about what kind of chips are present in the cartridge.

The other segments line up to the PRG/CHR split. `CODE` is, of course,
the game code that is stored in the PRG-ROM. `VECTORS` is a way to specify
code that should appear at the very end of the PRG-ROM block (for reasons we will discuss
later). And `CHARS` represents the entire contents of the CHR-ROM, generally
included as a binary file.

So, what are the contents of our CHR-ROM chip, and therefore the graphics that our game will display?

```ca65
.segment "CHARS"
.res 8192
```

`.res` is another assembler directive that tells the assembler to "reserve" a
certain amount of blank space - in this case, 8,192 bytes. But if the entire CHR-ROM is
empty, where does the green background that our test project displays come from?

## Colors and Palettes

When I said before that the CHR-ROM chip contains "all" of the graphics for our game,
I was simplifying a bit. To be more precise, the CHR-ROM chip contains <em>patterns</em>
of different colors to be displayed in the game. The colors themselves, however, are
part of the PPU itself. The PPU knows how to display a fixed set of 64 colors.<Margin id="color-palette-limits">Observant readers may notice that the color palette image here only contains 56 colors, not 64. The reason for this is that eight of the 64 colors the PPU knows how to display are just black. This is due to a quirk in how NTSC CRT televisions display color, not a mistake in designing the hardware.</Margin>

<figure>
  <img src={palette} alt="" />
  <figcaption>The NES color palette.</figcaption>
</figure>

Due to hardware limitations, you can't use all 64 colors at the same time. Instead,
you assign colors to the system's eight four-color _palettes_. Four of these
palettes are used for the "background", and the other four are used for the "foreground".

The eight palettes have one additional limitation: the first color of each of the eight
palettes must be the same. This first color is used as a "default" background color
(when nothing else is being drawn to the background for a given pixel, the default
color is used), and it serves as a transparency color for the foreground (foreground
pixels drawn with the first color act as transparent, allowing the background pixel
"behind" them to show through). These limitations mean that the NES can display
a maximum of 25 colors at a time - the one "default" color, and eight palettes
with three other colors each.

<figure>
  <img src={smbpalettes} alt="" />
  <figcaption>The eight palettes used in World 1-1 of Super Mario Bros. The top four palettes are used for the foreground and the bottom four palettes are used for the background. Notice that many elements, both foreground and background, are composed of the same patterns but different palettes - e.g. the different-colored turtles in the foreground and the bush/cloud graphics in the background. The blue first color of each palette is the color of the "sky" in the background of World 1-1.</figcaption>
</figure>

The PPU refers to each color with a one-byte number. Palette information is
stored in a specific location of the PPU's memory map (separate RAM that is
only accessed by the PPU itself). The 32-byte region in PPU memory from `$3f00`
to `$3f20` holds the contents of the eight palettes in sequence. The "default color",
being the first color of each palette, is stored at `$3f00`, `$3f04`,
`$3f08`, `$3f0c`, `$3f10`, `$3f14`,
`$3f18`, and `$3f1c`.<Margin id="default-color-repetition">While it is common to repeat the first color for each palette manually, technically the PPU only cares about the value written to `$3f00`. Our test program takes advantage of this fact to cut down on the amount of code that needs to be written.</Margin>

<figure>
  <img src={palwithnums} alt="" />
  <figcaption>The NES color palette, overlaid with the byte the PPU uses to refer to each color.</figcaption>
</figure>

## Back to the test project

Referencing the color chart above, the green background color of our test
project is `$29`. If we look back at our test project's code,
we find this:

```ca65 showLineNumbers{31}
LDA #$29
```

This line of assembly code tells the processor to get ready to use the
number `$29`, which corresponds to the green we display in the background.
We'll look at the details of how this line (and much of the rest of the
test project's source code) works in the next chapter.
