---
title: Introduction
next:
  url: 01-briefhistory
  title: 1. A Brief History of the NES
---

<script>
  import Margin from "$lib/components/Margin.svelte";
  import dwbox from "./Dragon_Warrior-box.jpg?w=240&format=webp";
  import iamerror from "./i-am-error.jpg?w=240&format=webp";
  import nesconsole from "./NES-Console-Set.jpg?w=480&format=webp";
</script>

Sometime in the fall of 1990, my parents gave me a Nintendo Entertainment
System Action Set: a grey, boxy Control Deck, two controllers, a bright orange
"Zapper" light gun, and a cartridge that contained both _Super Mario
Bros._ and _Duck Hunt_.<Margin id="nes-console-set"><img src={nesconsole} alt="" width=480 />
An NES console with one controller.<br>
Photo by [Evan Amos](https://commons.wikimedia.org/wiki/User:Evan-Amos).</Margin>The
Control Deck plugged into the big CRT TV
we had in the basement via an RF switch, basically an antenna that fed video
from the Control Deck to the TV when you tuned it to Channel 3. It was the
first video game console we had ever owned, and I loved it.

I spent a lot of time in the basement that year. At first, my dad did too -
he was working his way through _Super Mario Bros._, learning where the
secret Warp Zones were located and how to get past the menacing Hammer Bros.
Eventually he defeated Bowser (or “the dragon”, as he called him), saved the
princess, and never really played an NES game ever again.

I was hooked, though. We got a promotional letter in the mail
offering a free copy of _Dragon Warrior_
for subscribing to Nintendo Power magazine; signing
up for a $20 magazine subscription to get a $50 game was a
no-brainer.<Margin id="dragon-warrior-box"><img src={dwbox} alt="" width=240 /><br>
Dragon Warrior (US box art).</Margin> _Dragon Warrior_ introduced me to RPGs in the
same way that _Super Mario Bros._ had introduced me to
platformers. There were plenty of other games that I spent time
with, too: _Ducktales_, _Final Fantasy_,
_Contra_, and _Mega Man III_ were some of my favorites.

The NES ultimately set me on a career path. As a kid, I knew that video
games were special, and that making video games was what I wanted to do as an
adult. I had the (mistaken) belief that a career making video games meant a
career _playing_ video games. I started learning C++ once my
family got a computer because that was what “real” programmers used. (Little
did I know that NES programmers don't use C++, but in my defense I was young
and naive.) I never made any actual games, though. Game programming always
seemed more complicated than I was prepared for, and besides, there was no
shortage of great games from other people waiting to be played.

That dream stuck with me, and after years of being a professional web
developer I started learning NES development. (I got a strong nudge in the
right direction from Nathan Altice’s excellent
_I Am Error_.)<Margin id="i-am-error"><img src={iamerror} alt="" width="240" /><br><a href="https://mitpress.mit.edu/books/i-am-error">I Am Error.</a></Margin> It
was hard to know where to begin. There were plenty of resources around the
internet, but they were all incomplete or inaccurate in some way. I got started
with bunnyboy's ["Nerdy Nights"](https://nerdy-nights.nes.science) series on the NintendoAge forums. Then I found
tepples' [NROM template](https://github.com/pinobatch/nrom-template)
on GitHub, and started learning the ca65 assembler.
After months of struggling to understand PPU writes, attribute tables, and
scroll registers, it all started to click. I'm glad that I had the experience
of fighting with these concepts to learn on my own, but I wish that I could
have had a guide that started from scratch and taught all of the essentials of
NES development.

My hope is that the book you are now reading will serve as that guide.
