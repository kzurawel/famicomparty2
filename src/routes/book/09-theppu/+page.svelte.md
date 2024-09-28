---
title: 9. The Picture Processing Unit (PPU)
prev:
  url: 08-refactoring
  title: 8. Refactoring
next:
  url: 10-spritegraphics
  title: 10. Sprite Graphics
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import nespalette from './NES_color_palette.png?w=520&format=webp';
  import tileexample from './tile-example.png?w=520&format=webp';
  import mariosprites from './mario-sprite-table.png?w=520&format=webp';
  import mariobgs from './mario-bg-table.png?w=520&format=webp';
  import mm2flicker from './megaman2-flicker.mp4';
  import overlap from './overlapping-sprites.png?w=520&format=webp';
  import nametables from './nametables.png?w=520&format=webp';
  import bfight from './balloonfight-cartridge.jpg?w=520&format=webp';
  import attrtable from './attribute-table.png?w=520&format=webp';
  import qblock from './question-block.png?w=480&format=webp';
  import srr from './snake-rattle-roll.jpg?w=520&format=webp';
</script>

A "game" for the NES is made up of three components: graphics displayed on a screen, user input
through some kind of controller, and audio for music and sound effects. The game uses the
user's input to change the graphics it displays and the audio it plays, until the user
turns off the system. In this set of chapters, we will look at each of these three components,
beginning with how the NES displays graphics.

## Palettes

As you may remember from [Chapter 4](/book/04-hardwareoverview), the NES
uses a fixed set of 64 colors for all of its graphics.

<figure>
  <img src={nespalette} alt="" />
  <figcaption>The NES color palette.</figcaption>
</figure>

These colors are used to fill slots in eight four-color _palettes_. Four palettes are
used to draw background objects, and the other four palettes are used to draw _sprites_,
objects in the "foreground". Each thing drawn to the screen uses one of these palettes,
limiting a single graphical object to four of the 64 available colors.

## Pattern Tables

What exactly are these "graphical objects"? The NES does not let developers specify what to draw
on a pixel-by-pixel basis. At a resolution of 256x240 pixels, each screen of graphics would require
the specification of 61,440 pixels of color information, which would be far too much to fit into
memory. Instead, the basic unit of NES graphics is the 8x8 pixel "tile". One screen of graphics
is 32 tiles wide and 30 tiles tall (960 tiles).

The CHR-ROM in an NES cartridge holds two _pattern tables_, each of which holds 256
8x8 tiles. One pattern table is used for background graphics, and the other is used for sprite
graphics.<Margin id="eight-by-sixteen">Another option is to use 8x16 tiles (8px wide and 16px tall), as seen in games like <em>The Legend of Zelda</em>. While this reduces the number of tiles that can be stored in the pattern tables, this has the advantage of allowing tiles from either table to be used as either background or sprite. Depending on your game's graphical needs, the advantage of being able to re-use tiles in both layers might outweigh the disadvantage of having fewer tiles available.<br>These issues largely become moot with the use of mapper chips that allow for bank switching of pattern table graphics, which will be explored much later in this book.</Margin> Each tile in the table is defined with two "bit planes",
specifying which palette color (0-3)
is used for each pixel of the tile. One bit plane defines the "low bit" of each pixel in the
tile, and the other defines the "high bit". (Two bits, as you may recall, can represent four
different values, corresponding to the four colors in a palette.) Each tile takes up 16 bytes
of memory, so the CHR-ROM chip's 8KB of storage is just enough to fit the 512 tiles of the
two pattern tables. By specifying only a palette index rather than an actual color,
the tiles themselves take up less memory and can be re-used with different palettes
as needed.

<figure>
  <img src={tileexample} alt="" />
  <figcaption>An example pattern table tile. Bytes $xxx0-$xxx7 provide the "low bit" for each
pixel, and bytes $xxx8-$xxxf provide the "high bit" for each pixel.</figcaption>
</figure>

Everything that an NES game draws to the screen is contained in its pattern
tables.<Margin id="chr-ram">This is more complicated when CHR-RAM or bank switching are involved, though anything drawn is still, technically, present in the pattern tables at some point.</Margin> There
is no "system font"; if you want to draw text in your NES game, you need to
create font tiles in a pattern table. (This is why most NES games, especially
early NES games, tend to be all-caps, shouty affairs.) The limited space for tiles
also means that efficient re-use of tiles is important. Being able to re-use a tile
in multiple ways, or making clever use of palette swaps, can give a game a greater
range of visual representations while still fitting within the memory limitations of
CHR-ROM.

<figure>
  <img src={mariosprites} alt="Sprites pattern table from Vs. Super Mario Bros." />
  <img src={mariobgs} alt="Background pattern table from Vs. Super Mario Bros." />
  <figcaption>The sprite and background tables from <em>Vs. Super Mario Bros.</em>. Anything drawn
during the course of the game is present in these two tables, including Mario himself
(represented in the first five rows of the sprite table); all of the game's enemies;
text and score graphics (the first three rows of the background table); and the
many pipes, plants, and castles that appear throughout.</figcaption>
</figure>

## Sprites

Sprites represent the "foreground" layer of graphics. Each sprite is a single tile which
can be positioned anywhere on the screen, down to the pixel. Sprites can also be flipped
vertically or horizontally (but not rotated), and each sprite can specify which of the
four sprite palettes it will use. This flexibility comes at a cost, though: memory
and processing time constraints mean that the NES can only display 64 sprites at a time,
and only eight sprites can be drawn on a scanline (a horizontal row of pixels).

If you've played many NES games, you have likely experienced "flickering", where
some sprites appear and disappear rapidly in a way that does not seem intentional.

<figure>
  <video src={mm2flicker} type="video/mp4" autoplay loop muted />
  <figcaption>An example of sprite flicker from <em>Mega Man II</em>.</figcaption>
</figure>

This flicker is the result of too many sprites being drawn on one scanline. Since
the PPU can only draw eight sprites on a scanline, any sprites beyond the first
eight will not appear. The flickering effect, however, is a conscious choice on the
part of the game developer, to help the player. Flicker results when the developer
changes _which_ eight sprites come first each scanline. In doing so, the player can see
all of the sprites on the scanline, just not all at the same time. Otherwise, enemy
sprites might be entirely invisible, which would be unfair.

When sprites are drawn to the screen, any pixel within the tile that uses the first color
of the palette (index zero) is drawn as transparent, allowing the background layer to display
at that location. This means that each sprite can only use three colors. By using
transparency, it is possible to overlap sprites that use different color palettes
over one another, creating graphics that use more than three colors.

<figure>
  <img src={overlap} alt="" />
  <figcaption>Overlapping sprites used to create multicolor graphics. Mega Man's face is
missing because its sprite is not being drawn due to scanline restrictions. Note that
the missing area is not perfectly square, since transparency is being used to make
the face and helmet sprites blend together.</figcaption>
</figure>

## Backgrounds

Sprites have great flexibility at the expense of only being able to cover a small
portion of the screen. Backgrounds have the opposite trade-off. A background
can cover the entire screen &mdash; 960 8x8 tiles &mdash; but background tiles
must fit to a grid, and they suffer further limitations on palette use. The background
layer can be scrolled in 1-pixel increments, but all the tiles move together.
There is no way to scroll different parts of the screen differently without
using tricky mid-frame updates (e.g. "Sprite Zero Hit", scanline IRQ).

### Nametables

Backgrounds are defined via _nametables_, which live in PPU memory.
Each nametable is 960 bytes, and each of those bytes stores the tile number
of one of the 256 tiles in the background pattern table. The PPU memory map has
space for four nametables arranged in a square pattern, meaning that, in theory,
you could set up four TV screens worth of background at once.

<figure>
  <img src={nametables} alt="" />
  <figcaption>The four nametables, showing the starting PPU memory address for each.</figcaption>
</figure>

I say _in theory_ because the Famicom was designed to be cheap, as we
discussed in [Chapter 1](/book/01-briefhistory), and at
the time, memory was very expensive. As a compromise, the Famicom/NES has
enough physical memory for _two_ nametables. These are "real"
nametables that behave as expected. The memory ranges for the other
two nametables act as "mirrors" of the real nametables, so that
asking for a byte of memory from a mirror returns a byte from the corresponding
real nametable. The developer can configure which two nametables are "real"
and which two are "mirrored". On a hardware NES cartridge, this is done
with a pad of solder over one of two contacts on the cartridge board.
For emulators, a game's mirroring setting is part of its iNES header.

<figure>
  <img src={bfight} alt="" />
  <figcaption>The internals of a <em>Balloon Fight</em> cartridge. The red rectangle shows the
"V"/"H" contacts; whichever pair of contacts is soldered together will determine
whether the game uses vertical or horizontal mirroring. The "V" contact sets "vertical layout"
(horizontal mirroring) and the "H" contact sets "horizontal layout" (vertical mirroring). Image from
<a href="http://bootgod.dyndns.org:7777">NES Cart Database</a>.</figcaption>
</figure>

Mirroring can be _vertical_ or _horizontal_. In vertical mirroring,
nametables 1 and 2 are "real", and 3 and 4 are mirrors. This gives the developer
two screens in a left-to-right layout, perfect for horizontally-scrolling
games. Horizontal mirroring, in contrast, makes nametables 1 and 3 the
"real" nametables, and nametables 2 and 4 the mirrors. Horizontal mirroring
results in two screens in a top-to-bottom layout, which is designed for
vertically-scrolling games.<Margin id="mapper-mirroring">While mirroring is hard-soldered in older NES games, later cartridges that add mapper chips give the developer the ability to change mirroring at any time. The MMC1 chip, for example, allows _Metroid_ to switch between vertical and horizontal mirroring when the player moves through a doorway, allowing for a mix of horizontal and vertical scrolling sections.</Margin>

### Attribute Tables

A nametable is just a list of tile numbers. In order to color each tile with
a palette, we need a second type of table. At the end of each nametable is
a 64-byte region called an _attribute table_, which specifies which
palette to use for each tile of background. 960 + 64 = 1024 bytes, so each
nametable / attribute table pair takes one kilobyte of memory.

Since the attribute table is only 64 bytes, there isn't enough space to
specify a palette for each individual background tile. Instead, each
byte of the attribute table specifies the palette colors for sixteen
background tiles, in a four-by-four square. Bits 0-1 of each byte
specify the palette used for the top left two-by-two portion of the
four-by-four area, bits 2-3 the top right, bits 4-5 cover the bottom
left and bits 6-7 select a palette for the bottom right. This means
that in addition to background tiles being fixed to a grid, color
information is tied to its own grid as well.

<figure>
  <img src={attrtable} alt="" />
  <figcaption>An illustration of how each byte of the attribute table determines
palettes for sixteen background tiles.</figcaption>
</figure>

As a consequence of attribute table limitations, background objects
are generally drawn in 2x2 tile units. We call these larger objects
_metatiles_.

<figure>
  <img src={qblock} alt="" />
  <figcaption>The question mark (?) block from <em>Super Mario Bros.</em>, an
example of a metatile.</figcaption>
</figure>

The attribute table grid is also the reason why few NES games use
an "isometric", or angled, display. Trying to draw backgrounds at
an angle can cause color glitches when a large background section
crosses attribute table boundaries.

<figure>
  <img src={srr} alt="" />
  <figcaption>Backgrounds from <em>Snake, Rattle 'n Roll</em> (1990). Attribute
table boundaries result in one tile of the light blue "wall"
appearing dark blue, since it is part of the same 2x2 palette
block as the dark blue triangle.</figcaption>
</figure>
