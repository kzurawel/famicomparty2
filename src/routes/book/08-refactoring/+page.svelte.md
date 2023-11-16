---
title: 8. Refactoring
prev:
  url: 07-whydothis
  title: 7. Why Would Anyone Do This?
next:
  url: 09-theppu
  title: 9. The Picture Processing Unit (PPU)
---

<script>
  import Margin from '$lib/components/Margin.svelte';
</script>

Before we move on to learning more about how the NES draws graphics, let's take some time to reflect
on what we've already built. There are a number of improvements we can make now that will be useful
in the future. By refactoring now, we will create a useful template for our upcoming projects.

## Constants

There are several places in our code where we use a particular number that doesn't change,
such as MMIO addresses for talking with the PPU. It's hard to tell what these numbers are
referring to when looking at the code.

Thankfully, we can replace these abstract numbers with descriptive text, by declaring _constants_.
A constant is essentially a name for one number, which can't be changed. Let's create constants for
the PPU addresses we've used so far:<Margin id="mmio-address-naming">These names are the generally agreed-upon standard naming for the various MMIO addresses available in the NES. When looking through references like the NESDev wiki, you will see these names used.</Margin>

```ca65
PPUCTRL   = $2000
PPUMASK   = $2001
PPUSTATUS = $2002
PPUADDR   = $2006
PPUDATA   = $2007
```

With these constants, our main code becomes much more readable:

```ca65 showLineNumbers{25}
.proc main
  LDX PPUSTATUS
  LDX #$3f
  STX PPUADDR
  LDX #$00
  STX PPUADDR
  LDA #$29
  STA PPUDATA
  LDA #%00011110
  STA PPUMASK
forever:
  JMP forever
.endproc
```

Where do we put these constants? The common approach is to make a separate constants file, which
can be included into our main assembly file. We'll call the constants file
`constants.inc`.<Margin id="why-use-inc">Why does this file end in `.inc` instead of `.asm`? The constants file is not exactly assembly code; it doesn't have any opcodes. We will use the `.asm` extension for assembly code files, and `.inc` for files which are included into an assembly code file.</Margin> Then, we include the constants file at the top of our `.asm` file like this:

```ca65
.include "constants.inc"
```

## Header File

We can do the same thing with the `.header` segment, since it will generally
be the same from project to project. Let's make a `header.inc` file to hold
our header content. Now would also be a good time to add some comments:

```ca65
.segment "HEADER"
.byte $4e, $45, $53, $1a ; Magic string that always begins an iNES header
.byte $02        ; Number of 16KB PRG-ROM banks
.byte $01        ; Number of 8KB CHR-ROM banks
.byte %00000001  ; Vertical mirroring, no save RAM, no mapper
.byte %00000000  ; No special-case flags set, no mapper
.byte $00        ; No PRG-RAM present
.byte $00        ; NTSC format
```

Now we can delete the `.segment "HEADER"` section of our main `.asm`
file, and include our new header file. The top of our `.asm` file should now
look like this:

```ca65
.include "constants.inc"
.include "header.inc"

.segment "CODE"
```

When the assembler and linker run, they will take the contents of `header.inc`
and put them in the correct place in the output ROM, exactly the same as if we had
put it directly into the assembly file.

## ca65 Imports and Exports

A full reset handler can become quite large, so it can be useful to put it into a separate
file. But we can't just `.include` it, because we need a way to reference the reset handler
in the `VECTORS` segment.

The solution is to use ca65's ability to import and export `.proc` code. We use
the `.export` directive to inform the assembler that a certain proc should be
available in other files, and the `.import` directive to use the proc
somewhere else.

First, let's create `reset.asm`, including the `.export` directive:

```ca65 showLineNumbers
.include "constants.inc"

.segment "CODE"
.import main
.export reset_handler
.proc reset_handler
  SEI
  CLD
  LDX #$00
  STX PPUCTRL
  STX PPUMASK
vblankwait:
  BIT PPUSTATUS
  BPL vblankwait
  JMP main
.endproc
```

There are a few things I'd like to point out in this file. First, the file ends in `.asm`,
because it contains opcodes. Second, we include the constants file so that it can be used here.
Third, we need to specify which code segment this `.proc` belongs in, so the linker
knows how to put everything together. Finally, note that we are importing `main`. This
way, the assembler knows what memory address the `main` proc is located at, so
the reset handler can jump to the correct address.

Now that we have a separate reset file, we'll use `reset_handler` inside our code:

```ca65 showLineNumbers{4}
.segment "CODE"
.proc irq_handler
  RTI
.endproc

.proc nmi_handler
  RTI
.endproc

.import reset_handler

.export main
.proc main
  ; contents of main here
.endproc

.segment "VECTORS"
.addr nmi_handler, reset_handler, irq_handler
```

On line 13, where our `.proc reset_handler` used to be located, we now import
the proc from an external file. Note that you do not need to specify which file the proc
comes from - the assembler scans all `.asm` files for exports before it starts
assembling, so it already knows what external procs are available and where they are located.
(Note that this also means you can't export two procs with the same name - the assembler
will have no way to tell which one you are referring to in an
`.import`.)<Margin id="multiple-segments">You may have noticed that `reset.asm` uses `.segment "CODE"`, and our main assembly file also uses `.segment "CODE"`. What happens when we assemble and link these files? The linker finds everything that belongs to the same segment and puts it together. The order does not particularly matter, since labels are converted into addresses at link time.</Margin> We also have to export our `main` proc, so that the reset handler can import
it and know where to jump to when it is finished.

## Custom Linker Configuration

When we linked our sample project back in [Chapter 3](/book/03-gettingstarted),
we used this command:

```shell
ld65 helloworld.o -t nes -o helloworld.nes
```

The `-t nes` tells ld65 to use the default linker configuration for
the NES. This is why we have the "STARTUP" segment, despite never using it.
While the default configuration works for the sample project, it can lead
to problems as our code becomes larger and more complicated. So, instead
of using the default configuration, we will write our own linker configuration
with only the segments and features that we need.

Our custom linker config will be in a file called `nes.cfg`, which
will look like this:

```shell
MEMORY {
  HEADER: start=$00, size=$10, fill=yes, fillval=$00;
  ZEROPAGE: start=$10, size=$ff;
  STACK: start=$0100, size=$0100;
  OAMBUFFER: start=$0200, size=$0100;
  RAM: start=$0300, size=$0500;
  ROM: start=$8000, size=$8000, fill=yes, fillval=$ff;
  CHRROM: start=$0000, size=$2000;
}

SEGMENTS {
  HEADER: load=HEADER, type=ro, align=$10;
  ZEROPAGE: load=ZEROPAGE, type=zp;
  STACK: load=STACK, type=bss, optional=yes;
  OAM: load=OAMBUFFER, type=bss, optional=yes;
  BSS: load=RAM, type=bss, optional=yes;
  DMC: load=ROM, type=ro, align=64, optional=yes;
  CODE: load=ROM, type=ro, align=$0100;
  RODATA: load=ROM, type=ro, align=$0100;
  VECTORS: load=ROM, type=ro, start=$FFFA;
  CHR: load=CHRROM, type=ro, align=16, optional=yes;
}
```

The `MEMORY` section lays out the regions of memory that segments
can be placed into, while the `SEGMENTS` section describes the
segment names we can use in our code and which memory areas they should be
linked into. I won't be going into detail on what each setting means, but
you can find in-depth documentation in the
[ld65 docs](https://cc65.github.io/doc/ld65.html).

To use this custom linker configuration, we first need to update the segment
names in our code to match the config file's segment names. In our case,
the only needed changes are moving `"CHARS"` to `"CHR"`
and removing `"STARTUP"`.

## Putting It All Together

Finally, we need to update the structure of our files a bit. We will move
all of the `.asm` and `.inc` files into a sub-directory,
`src`, with our new linker config at the top level. The code
we have after all of our refactoring should now look like this:

```shell
08-refactoring
   |
   |-- nes.cfg
   |-- src
      |
      |-- constants.inc
      |-- header.inc
      |-- helloworld.asm
      |-- reset.asm
```

To assemble and link our code, we will use the following commands (run from
the top-level `08-refactoring` directory):

```shell
ca65 src/helloworld.asm
ca65 src/reset.asm
ld65 src/reset.o src/helloworld.o -C nes.cfg -o helloworld.nes
```

To be clear, what we are doing here is first assembling each `.asm`
file to create `.o` files. Once that is done, we pass all of the
`.o` files to the linker. Instead of using the default NES
linker config (`-t nes`), we use our new custom config
(`-C nes.cfg`). The output from the linker is placed into
the same `helloworld.nes` ROM file.

If you would like to download a copy of the files listed above, here is
a <a href="https://famicom.party/book/projects/08-refactoring.zip">ZIP file</a> of everything
so far. We'll be using this setup as a base for our future projects, so
be sure that you are able to assemble, link, and run the code before
moving on.
