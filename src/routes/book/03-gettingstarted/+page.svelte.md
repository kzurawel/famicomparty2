---
title: "3. Getting Started"
prev:
  url: "02-fundamentalconcepts"
  title: "2. Fundamental Concepts"
next:
  url: "04-hardwareoverview"
  title: "4. NES Hardware"
---

<script>
  import Margin from "$lib/components/Margin.svelte";
  import Nes from "$lib/components/Nes.svelte";
  import mesen2 from "./mesen2.png?w=480&format=webp";
  import nexxt from "./nexxt.png?w=480&format=webp";
  import famistudio from "./famistudio.png?w=480&format=webp";
</script>

Let's get started actually programming for the NES! In this chapter, we're going to
set up a development environment, installing all of the tools that you will need
to work through this book, and then we will build and run the most basic game
possible just to make sure everything is working.

## Setting Up Your Development Environment

Here are all of the tools that we will be installing. Some of these will be used
right away (and all the time), while others are more specialized and won't come
into play until much later. For each category, I'm including the specific
software I will be using in this book; there are many other choices, so feel
free to experiment with other tools once you get comfortable with my recommendations.

- A text editor (your choice)
- An assembler/linker (ca65 and ld65)
- An emulator (Mesen2)
- A graphics tool that can read/save NES formatted images (NEXXT)
- A music composition tool (FamiStudio)

## Text Editor

First, you will need a _text editor_. I assume that you have previous
programming experience and that, as a result, you already have a favorite text
editor. If not, here are a few programs that you may want to try.

- [Sublime Text](https://www.sublimetext.com/). Cross-platform, popular
  with web developers, easy to get started with and powerful tools once you
  get familiar with the basics.
- [Atom](https://atom.io/). Basically GitHub's answer to Sublime Text.
  Cross-platform, highly configurable.
- [Visual Studio Code](https://code.visualstudio.com/). Microsoft's robust
  text editor platform. Tailored for web development but extensible for any kind
  of programming. Also cross-platform, not limited to Windows.
- Vim, emacs, nano, etc. Command-line text editors of yore. (I personally use Vim, but
  your mileage may vary.)

## Assembler and Linker

An _assembler_ compiles your assembly code (what we will be writing in this book)
into machine code, the raw stream of bytes that the processor reads. A _linker_
takes a group of files that have been run through the assembler and turns them into a
single program file. Since each processor has its own machine code, assemblers usually
target only one type of processor. There are many assemblers and linkers to choose from
for the 6502, but for this book we will be using ca65 and ld65. They are open-source and
cross-platform, and have some very useful features for developing larger programs. ca65 and
ld65 are part of the larger "cc65" suite of programs, which include a C compiler and more.

### Mac

To install ca65 and ld65 on a Mac, first install [Homebrew](https://brew.sh), a
Mac package manager. Copy and paste the command from the homepage into a terminal and press
enter; follow the instructions and Homebrew will be ready to use. Once you have Homebrew,
type `brew install cc65` and press enter.

### Windows

On Windows, you'll need to download ca65 and ld65 to a specific directory on your computer.
Download the latest "Windows Snapshot" from the [main cc65 project page](https://github.com/cc65/cc65).
Unzip the contents to `C:\cc65`. You'll also need to update
your system path to make ca65 and ld65 available from any directory. The process for doing
this varies depending on which version of Windows you are using. On most newer versions of
Windows, you can right-click "My Computer", select "Properties", then "Advanced System Settings"
and finally "Environment Variables". You'll want to find the entry for `%PATH%` and
add `C:\cc65\bin` to the end of it.


### Linux

You will need to build cc65 from source. Thankfully, this is a fairly simple process. First,
make sure you have git and a basic build environment - on Ubuntu, for example, `sudo apt-get
install git build-essential` should do it. Then, navigate to the directory where you want
to install cc65, clone the cc65 repository, and build it:

```shell
git clone https://github.com/cc65/cc65.git
cd cc65
make
```

Finally, make the cc65 programs available from any directory with `sudo make avail`. This will
add symlinks from your cc65 folder to `/usr/local/bin`.

## Emulator


An _emulator_ is a program that runs programs intended for a different computer system.
We will use an NES emulator to run the programs that we create on the same computer used to
develop them, instead of requiring a hardware NES. There are a number of NES emulators available
(and, once you have a solid grasp of NES development, it's fun to try to make your own!), but
for this book we will be using [Mesen2](https://github.com/SourMesen/Mesen2).<Margin
id="mesen2"><img src={mesen2} alt="" width="480" /><br/>Mesen2.</Margin> It
is cross-platform and features powerful debugging tools, which will be useful as we write programs.


### Windows / Linux / Intel-based Mac

For these systems, download the latest
[development release](https://nightly.link/SourMesen/Mesen2/workflows/build/master),
then unzip. You will need to install
[.NET Runtime v6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
on all systems. Non-Windows systems will also need to install SDL2 through your OS'
package manager or Homebrew on Mac.

### ARM-based Mac (M1, M2, etc.)

On these systems, you will need to build Mesen2 from source. First, install SDL2 via Homebrew
(`brew install sdl2`), then install the [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0).
Download Mesen2's source code and run `make`:

```shell
git clone https://github.com/SourMesen/Mesen2.git
cd Mesen2
make
```

When the build process is complete, you will have `Mesen.app` in the `bin/osx-arm64/Release/osx-arm64/p
ublish` directory inside of the `Mesen2` directory where you ran `make`. Move `Mesen.app` into your Applications folder.

## Graphics Tools

The NES stores graphics in a very different format from common image types like JPEG or PNG. We
will need a program that can work with NES images. There are plugins for large graphics
packages like Photoshop or GIMP, but a smaller, purpose-built tool is often a better choice.
For this book, we will be using
[NEXXT](https://frankengraphics.itch.io/nexxt),<Margin id="nexxt"><img src={nexxt} alt="" width=480 /><br/>NEXXT.</Margin> a derivative of
[NES Screen Tool](https://shiru.untergrund.net/software.shtml).
NEXXT is a Windows-only program, but runs well on other platforms under WINE.


### Windows

Download NEXXT from [itch.io](https://frankengraphics.itch.io/nexxt/purchase). Unzip, and run
NEXXT.exe.

### Linux

Since NEXXT is a 32-bit, Windows-only program, Linux users will have to run it via
[WINE](https://www.winehq.org). Install WINE via your distribution's package manager,
then run NEXXT.exe with it (`wine NEXXT.exe`).

### Mac

Newer Mac versions (starting with Catalina) are 64-bit only, and 32-bit software will not run
even in a standard WINE install. Thankfully, 32-bit Windows programs can be run using the
"Crossover" version of WINE, which is able to translate 32-bit code into 64-bit code
on the fly. Install Crossover via Homebrew
(`brew install --cask gcenx/wine/wine-crossover --no-quarantine`).
Download NEXXT as above and unzip, then run `wine64 ./NEXXT.exe` in the directory where
you unzipped it.


## Music Composition Tools

As with graphics, NES audio is a set of instructions to an audio processor rather than something
like an MP3. The most popular program for creating NES audio is
[FamiTracker](http://www.famitracker.com/),
which is powerful but complex and Windows-only. For this book, we will be using
[FamiStudio](https://famistudio.org), <Margin id="famistudio"><img src={famistudio} alt="" width="480" /><br/>FamiStudio.</Margin> which is cross-platform, has a friendlier
interface, and outputs directly into an easy-to-integrate format.

### Windows / Mac / Linux

Download the latest release from the [FamiStudio website](https://famistudio.org).


## Putting It All Together

Now that you have all of the tools installed, it's time to make sure that they work. We are going to
create the "Hello World" of NES games: filling the entire screen with one color.

Open your text editor and create a new file, `helloworld.asm`. Copy and paste the following
code into the file:


```ca65 title="helloworld.asm"
.segment "HEADER"
.byte $4e, $45, $53, $1a, $02, $01, $00, $00

.segment "CODE"
.proc irq_handler
  RTI ; testing out a comment
.endproc ; just for fun

.proc nmi_handler
  RTI
.endproc

.proc reset_handler
  SEI
  CLD
  LDX #$00
  STX $2000
  STX $2001
vblankwait:
  BIT $2002
  BPL vblankwait
vblankwait2:
  BIT $2002
  BPL vblankwait2
  JMP main
.endproc

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

.segment "VECTORS"
.addr nmi_handler, reset_handler, irq_handler

.segment "CHARS"
.res 8192
.segment "STARTUP"
```

Next, we need to use our assembler. In the directory where you saved helloworld.asm,
run `ca65 helloworld.asm`. The result should be a new file, helloworld.o.
This is an _object file_ - machine code. But it is not in a format that is
ready to plug into an emulator just yet. To do that, we need to run the linker.
In the same directory, run `ld65 helloworld.o -t nes -o helloworld.nes`.
This should result in a new file, helloworld.nes - a "ROM" file for the emulator.

Open Mesen2 and choose "Open" from the "File" menu. Select the helloworld.nes file
you just created and click Open. The result should be a green screen.<Margin id="explain-nes-examples">The green screen here is an actual, running NES emulator in your browser! I am using <a href="https://github.com/binji/binjnes">binjnes</a> by Ben Smith.  Whenever we compile a .nes file, I will include a running demo like this one. (It's hard to tell in this case, but the emulator is actually running at 60fps.)</Margin>

<Nes rom="/roms/helloworld.nes" />


## Next Steps

If you were able to see the green screen in Mesen2, congratulations! Your development
environment is ready to use. In the next chapter, we will discuss what the code you
copied and pasted is actually doing, and learn a bit about how the NES hardware works.

