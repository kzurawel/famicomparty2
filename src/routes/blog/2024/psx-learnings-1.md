---
title: PSX learnings, part 1
date: 2024-01-11
summary: Getting started with PSX development.
tags:
  - psx
  - software
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import rg35xx from './img/rg35xx.png?w=240&format=webp';
</script>

Over the winter holidays, I got an [Anbernic RG35XX](https://anbernic.com/products/rg35xx) handheld.<Margin id="rg35xx"><img src={rg35xx} alt="" width=240 /><br/>An Anbernic RG35XX in Transparent White.</Margin> It has a Game Boy-style form factor and a powerful-enough processor to run (most) PlayStation games at full speed and still get about four hours of battery life. I originally expected to use it mostly for SNES and Game Boy Advance games, but I've found myself drawn to the PlayStation's library. I never had a PS1 growing up; I was really invested in the SNES, and I later got an N64 but only had a few games for it. My first real exposure to PS1 games was when I bought a PS2 and realized the PS1 library was a great source of JRPGs I hadn't played before. Even then, I didn't actually play much from the PS1 because, well, there were a lot of great PS2 games to play. (Seriously, what an impressive library of titles the PS2 has.)

So, spending lots of time with PS1 games got me wondering how the system works at a low level, and how someone might go about writing their own games for the system. There's quite a bit of info out there, most of it from the early 2000s, but figuring out how everything fits together takes some work. There are multiple approaches to working with the system and no shortage of arguments for or against using them. I'm enjoying my time researching, and maybe this will turn into a new tutorial series at some point, but for now I'd like to just share some of the things I've learned and a few resources I've found useful.

## The SDK question

Being a fifth-generation video game console, almost all games for the PS1 were programmed in C. (The NES, in contrast, is a third-generation console.) Sony themselves recommended developers use C, and provided "their own" SDK of helpful library functions. It wasn't really Sony's SDK; Sony acquired Psygnosis, a studio based in the UK, in 1993 to help create in-house games for their upcoming console. Sony's recommended development environment at the time was to buy a very expensive MIPS workstation from them, but Psygnosis had experience building games for other systems on basic Windows PCs using tools written by SN Systems. Psygnosis arranged a meeting between its new owner Sony and SN Systems and a deal was made to build a version of the tools targeting the new PlayStation console.<Margin id="snsystems">Sony later purchased SN Systems outright to create development toolkits for the PS3 and later consoles.</Margin> That SDK became the official Sony dev tool set, known as the "Programmers Tool SDK" or, as it is commonly known, **psyq**.

Using psyq has a bunch of advantages. It's the SDK that virtually all commercial PlayStation games were written with, and there is plentiful documentation _from Sony themselves_ on how to use it. At the same time, many devs feel like the SDK is not particularly well-written, the tools are only designed to run on 32-bit Windows 95, and the SDK is still covered under license terms that require you to be a licensed PlayStation developer to use it. It's highly unlikely that Sony actually cares about anyone using the tools at this point, but it also makes the idea of releasing a game built with psyq questionably legal.

As a result, there have been attempts to create open-source SDKs that can be used in place of psyq. The most popular is probably [**PSn00bSDK**](https://github.com/Lameguy64/PSn00bSDK), a project by "Lameguy64" that aims to be a full replacement for psyq, with a nearly identical API for ease of transitioning old codebases. It is in ongoing development, but already has support for most of what the hardware is capable of. Based on the repository's to-do list, the sound engine is in need of the most work, but there is also this item:

> `libpsxgte`: Rewrite all assembly functions from scratch as parts of them have been lifted as-is from Sony libraries. *PSn00bSDK is currently (and will probably always be) in a legal gray area due to this.*

_(emphasis in original)_

This puts projects built with PSn00bSDK on a similar (but likely safer?) legal ground to those written with the official SDK. There is plenty of documentation on PSn00bSDK as well, including a tutorial series by its author.

Finally, there is a completely new approach that aims to shift PS1 development from C to C++. The [**PSYQo**](https://github.com/pcsx-redux/nugget/tree/main/psyqo) project is a new set of C++ libraries built on top of the psyq build toolchain. It also breaks away from the psyq paradigm and implements its own scene-based approach to development. So, again, same issues with license terms, but if you are already comfortable with C++ development, PSYQo seems like a very nice, modern approach to developing for the system.

It's still too early for me to have a definitive direction here, but I've been working with psyq so far. You can get the SDK running on modern computers (Windows, Linux, or even Mac) via another project called [nugget](https://github.com/pcsx-redux/nugget/), which somehow converts the original psyq libraries into something modern GCC tools can work with (provided you have built out a MIPS GCC toolchain). To get this whole thing set up, the easiest approach comes from a collection of example projects called [nolibgs_hello_worlds](https://github.com/ABelliqueux/nolibgs_hello_worlds).<Margin id="libgs">The `nolibgs` here is because the examples do not use libgs, a more high-level graphics API included in psyq. General consensus seems to be that the libgs functions are not well written and much slower than doing the same functions by hand. Every PSX dev website says "don't use libgs".</Margin> The README has instructions on setting up the MIPS toolchain and getting Nugget / psyq installed on all major platforms. If you're on a Mac, use the Homebrew scripts to build the toolchain, then follow the Linux instructions for building Nugget/psyq.

## Running the code

Once you've got everything installed, you can build the examples just by running a Makefile, which produces a `.ps-exe` file. This is a program built to run on a PlayStation, but it is _not_ a CD image - this is just code that you could load into the PS1's 2MB of RAM and run. To build an actual CD, you need another tool, [mkpsxiso](https://github.com/Lameguy64/mkpsxiso), which takes an XML file specifying what to put on the disc and then creates a .bin/.cue pair or .iso file that could be burned to an actual disc.

Great, but how do you run these on your computer? At this point the only emulator seriously worth using is [PCSX Redux](https://github.com/grumpycoders/pcsx-redux). Just download a pre-built package for your OS and run it, no need to find and configure plugins or anything like that. Once you have it running, use File -> Load binary and choose your .ps-exe file, then click Emulation -> Start emulation. PCSX Redux is in _active_ development; it already runs pretty much anything you can throw at it, but it continues to evolve with new commits to the project seemingly every few days.

That's enough to get started! Here are some of the links I've found useful so far:

- [What do I need to start developing on PSX?](https://psx.arthus.net/starting.html) has links to a number of useful projects
- [Lameguy's PlayStation Programming Series](http://lameguy64.net/svn/pstutorials/index.html) (username and password to access are both `annoyingmous`) is written to use PSn00bSDK but, as mentioned, that SDK is generally compatible with psyq. Just change a few include names and the occasional function call and it will work the same. A fairly deep dive into how the system works, though I'd love for something that goes even more in-depth. (That might be my next project...)
- [PSX.Dev](https://www.psx.dev) is a community site for PSX homebrew development. Not as thorough as the NESDev wiki/forums, but plenty of great info and a link to the PSX.Dev Discord server.
- [Psy-Q Docs](https://psx.arthus.net/sdk/Psy-Q/DOCS/) has PDFs of a large number (all?) of official Sony developer documents, including detailed technical discussions of how to get more performance out of the machine (and notes to developers on what kinds of games Sony will, and will not, accept for publishing; "derivative racing games the(_sic_) do not look as good as Ridge Racer are not going to be approved.").
- [PlayStation Architecture](https://www.copetti.org/writings/consoles/playstation/) by Rodrigo Copetti is a super deep dive into the PlayStation hardware. Especially good reading paired with his architecture analyses of other 5th-gen consoles, like the Sega Saturn.

Next time, I'll go over some of the interesting features of PlayStation hardware.
