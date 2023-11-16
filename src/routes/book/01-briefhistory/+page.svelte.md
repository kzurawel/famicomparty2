---
title: 1. A Brief History of the NES
prev:
  url: 00-introduction
  title: Introduction
next:
  url: 02-fundamentalconcepts
  title: 2. Fundamental Concepts
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Sidenote from '$lib/components/Sidenote.svelte';
  import nesconsole from './NES-Console-Set.jpg?w=480&format=webp';
  import radarscope from './Radar_scope_arcadeflyer.png?w=480&format=webp';
  import rsgameplay from './Radar-scope-gameplay.png?w=480&format=webp';
  import shigeru from './shigeru-miyamoto.jpg?w=480&format=webp';
  import donkeykong from './Donkey_Kong_Gameplay.png?w=480&format=webp';
  import z80 from './Z80.png?w=480&format=webp';
  import mos6502 from './MOS6502.jpg?w=480&format=webp';
  import famicom from './Famicom-Console-Set.jpg?w=480&format=webp';
  import ROB from './rob.png?w=480&format=webp';
  import CIC from './10NES.jpg?w=480&format=webp';
</script>


In broad terms, the NES (“Nintendo Entertainment System”) is a home
video game console designed to connect to a CRT television. It uses
interchangeable, read-only cartridges (“Game Paks”) to store games,
since the system has no permanent means of storage. Input comes in
the form of two controller ports on the front of the system; the
standard NES controller has a 4-way, cross-shaped directional pad
and four additional buttons, labelled Start, Select, A, and
B.<Margin id="nes-console-set"><img src={nesconsole} alt="" width=480 />An
NES console with one controller.<br>Photo
by <a href="https://commons.wikimedia.org/wiki/User:Evan-Amos">Evan Amos</a>.</Margin>

The NES was first released in the U.S. in 1985; no one is sure
exactly when, but most sources estimate it was in October of that year.
Nintendo continued to sell the NES in the U.S. until 1995, well past the launch
of its successor, the Super NES, in 1991. During that ten-year period, nearly
700 officially-licensed games were released for the NES, produced both by
Nintendo directly and by a wide range of third-party developers like Konami and
Capcom. It was the best-selling video game console of its
generation,<Sidenote id="sheff-gameover">David Sheff.
_Game over: how Nintendo zapped an American industry, captured
your dollars, and enslaved your children_. 1st edition. Random House New York, 1993.
ISBN: 0679404694.</Sidenote> with “playing Nintendo” becoming synonymous with
video games in the U.S. in the same
way that “playing Atari” had been in the previous decade.

The NES did not spring fully-formed from a Nintendo R&D lab. A
unique series of failures and innovations led to the system
becoming a powerhouse in the home video game space. So, before we
start to work with the NES, it is important to take a step back and
discuss where the system came from. The historical background that
led to the NES had important implications for the system’s design
and capabilities, which will ultimately impact the games that can
(and can't) be made for the system.

## The American Experiment

Nintendo began in 1889 in Kyoto, Japan, as a _hanafuda_ playing cards
manufacturer.<Sidenote id="kohler-nintendo-history"><a href="https://www.wired.com/2010/09/0923nintendo-founded/">Sept. 23, 1889: Success is in the Cards for Nintendo</a>.</Sidenote> When
Hiroshi Yamauchi, the great-grandson of company founder Fusajiro Yamauchi,
took over the business in 1949, he
began to expand the company’s product line, diversifying into new
areas like taxi services, love hotels, and toys like the Ultra Hand.<Sidenote id="gadgets-360-ultra-hand"><a href="https://gadgets.ndtv.com/games/features/as-nintendo-turns-125-6-things-you-may-not-know-about-this-gaming-giant-596606">As Nintendo Turns 125, 6 Things You May Not Know About This Gaming Giant.</a></Sidenote> Nintendo would not find breakout success until it began creating
electronic toys. Nintendo began producing the Color TV-Game series of home
“Pong”-clone video game consoles in 1977, and in 1980, they released the
“Game & Watch” series of handheld video games.<Sidenote id="high-score"><a href="https://www.worldcat.org/title/high-score-the-illustrated-history-of-electronic-games/oclc/53241869">High Score!: The Illustrated History of Electronic Games.</a></Sidenote>

Nintendo had released a few arcade games by this point, the most
successful being 1979’s _Radar Scope_<Margin id="radar-scope-flyer"><img src={radarscope} alt="" width="480" /><br>A promotional flyer for Radar Scope.<br><br><img src={rsgameplay} alt="" width="480" /><br>Radar Scope gameplay.</Margin>, a space shooter game that was
the #2 arcade game in Japan behind Namco’s Pac-Man.<Sidenote id="ultimate-history"><a href="https://www.worldcat.org/title/ultimate-history-of-video-games/oclc/59416169">The Ultimate History of Video Games: From Pong to Pokemon - the Story Behind the Craze That Touched Our Lives and Changed the World</a>.</Sidenote> By 1978, Namco had already found great
success in American arcades, and
Taito had licensed its wildly-popular Space Invaders to Midway for
the U.S. market as well. Nintendo knew that the American market
presented a huge opportunity, but it would need to compete with
both its Japanese rivals as well as American arcade companies like
Atari.

Nintendo president Hiroshi Yamauchi thought Radar Scope would be an
excellent way to start a Nintendo U.S. branch. In 1980, he gave his
son-in-law, Minoru Arakawa, instructions to rent office and
warehouse space for a new “Nintendo of America”, and shipped him 3,000
Radar Scope machines from Japan.

Unfortunately, waiting nearly a year to begin shipment of Radar
Scope machines&mdash;plus the extra two weeks it took for them to get
from the west coast to Arakawa’s New Jersey warehouse&mdash;meant that
Radar Scope looked and felt dated, and American buyers were not
particularly interested. Arakawa’s sales team were only able to
sell about 1,000 Radar Scope machines, with the rest sitting in the
warehouse gathering dust.

This was a serious problem for Nintendo. In the early 1980’s,
2,000 arcade machines represented a substantial amount of money.
For the sake of comparison, during this time period Atari would
provide interested customers
with a “Project Materials Cost Estimate” detailing the parts
required for an arcade cabinet and their costs. A typical Atari
arcade game like Missile Command contained $871 in parts, and
would sell to an arcade or bar for $1,995.<Margin id="arcadeblogger">For much more detail on the arcade business of the early '80's, see <a href="https://arcadeblogger.com/2016/05/13/arcade-factory/">Tales from the Arcade Factory Floors</a>.</Margin> In 2018 dollars,
that would be equivalent to about $2,695 in parts for a selling
price of $6,170. 2,000 unsold arcade machines therefore
represented over five million dollars (2018 equivalent) in sunk
costs.

Hiroshi Yamauchi had an idea: what if Nintendo designed a new game
that could re-use the majority of Radar Scope’s components,
something more appealing to American buyers? Yamauchi set aside
$100,000 (1980 dollars) for the project, and handed
responsibility for coming up with the new game to a young designer
who had previously worked on the exterior shell of the Color
TV-Game series. That designer was Shigeru Miyamoto,<Margin id="shigeru-miyamoto"><img src={shigeru} alt="" width="480" /><br>Shigeru Miyamoto, at E3 2013.<br>Photo by Jan Graber, licensed CC-BY-SA 3.0 de.</Margin> who would later
become famous as the creator of Mario, Link, and many more of
Nintendo’s most famous game characters.

Miyamoto created a game that featured a fearless carpenter whose girlfriend had
been captured by a large ape. His inspirations included the comic strip Popeye
and the classic film King Kong. The result was _Donkey Kong_.<Margin id="donkey-kong"><img src={donkeykong} alt="" width="480" /><br>Donkey Kong.</Margin> To make the game
more “American”, Nintendo of America named the hero “Mario” (after warehouse
landlord Mario Segale), and named the hero's girlfriend “Pauline”. Donkey
Kong was enormously popular, both in the U.S. and Japan, and it set up
Nintendo as an arcade powerhouse.

## The Home Market

The success of the Radar-Scope-to-Donkey-Kong conversion project also led
to another great idea: a home system which, like a Radar Scope cabinet,
could run different game software on the same hardware. Home video game systems
up to this point had been single-use machines, often built to play just
one game (potentially with variants on a theme). Nintendo's own Color TV-Game
could play six or fifteen varieties of Pong, depending on which model the user
purchased, but nothing else. The most versatile system of the era was the
Magnavox Odyssey, which could play over a dozen games by swapping out "game cards"
included with the system. The cards did not contain any actual game data, though;
they merely activated different parts of the system's internal circuitry, meaning
the Odyssey's future expansion was extremely limited. The proposed Nintendo
home system would operate the same way the arcade Donkey Kong machine did:
game code would live on chips separate from the main processing components,
with no pre-programmed game code on the system itself.

There was one major obstacle to creating such a system: cost. Video games, especially
for the home, were marketed to families with children as a fun way to spend time
together. If the machine were too expensive, parents would not consider buying
it, no matter how good its games were. No parent would be willing to spend $871
for a home system, so Nintendo R&D had to find a way to make the
Donkey Kong arcade cabinet for less. Yamauchi's goal was a system powerful enough
to play Donkey Kong in the home, but able to sell for a mind-boggling &yen;9,800
(equivalent to about $40 USD).

To meet that price target, Nintendo R&D started with the system's processor. The
Donkey Kong arcade machine used, at its core, a Zilog Z80 processor<Margin id="zilog-z80"><img src={z80} alt="" width="480" /><br>A Zilog Z80 processor.</Margin>, developed by a
group of former Intel engineers who attempted to take all of the great features
of the Intel 8080 series of processors and implement them in a smaller, faster,
and cheaper package. The Z80 was everywhere in the Japanese computer market, powering
the "MSX" standard for home computers.

Nintendo was unable to find a manufacturing partner that would agree to its strict
requirements, however. The only Japanese company desperate enough to sign a deal with Nintendo
was Ricoh. Ricoh was utilizing only 10% of its chip manufacturing capability at the
time, so to increase business it agreed to provide Nintendo with three million processors, purchased up-front.
Nintendo was going all-in on their home console bet.

Ricoh, however, did not have a license to manufacture the Z80. Securing that license
would be costly and take a long time, so Ricoh instead offered an alternative: why
not use the MOS Technologies 6502 instead?<Margin id="mos-6502"><img src={mos6502} alt="" width="480" /><br>The MOS Technologies 6502.<br>Photo by Dirk Oppelt, CC-BY-SA</Margin> Ricoh already had a license to manufacture the 6502, an 8-bit processor with a
similar performance profile to the Z80. As an added bonus, it was relatively unknown
in Japan (despite powering the Apple II, Commodore 64, Atari VCS, and many other
computers popular in the West). Adopting the 6502 as the core of their new system
would grant Nintendo a type of copy protection, since games written for Nintendo's
system would not be easily portable to competitors' systems.

The MOS Technologies 6502 was developed by a group of former Motorola engineers who
attempted to take all of the great features from the Motorola 6800 series of processors
and implement them in a smaller, faster, and cheaper package. (Sound familiar?)<Margin id="bcd-issues">Ricoh had a license to manufacture the 6502, but it did <em>not</em> have a license
for the "binary-coded decimal" (BCD) functionality of the chip. To avoid running
afoul of MOS Technologies, Ricoh's processor cut all electrical connections between the BCD module and the rest of the chip. When MOS Technologies was purchased by Commodore, the latter
attempted to sue Nintendo for license violations but gave up when Commodore engineers
discovered Ricoh's fix.</Margin> You can still buy 6502-based processors today from Western Design Center (WDC), and they are
commonly used in industrial applications. The 6502 became available for purchase in 1975,
meaning it was already ten years old when Nintendo chose to use it in its new home system.
Individual 6502 processors in 1975 sold for $25 each, and Nintendo's bulk order drove
the per-processor price even lower.
Ricoh paired its 6502-based processor with a custom "Picture Processing Unit" (PPU) to handle
drawing graphics to the screen. The PPU allowed for sophisticated graphics, supporting a 64
color palette, a 256x240 pixel resolution display, 64 hardware sprites, and a hardware-scrolling
background layer.

With the internals set, all that remained was to design the outer casing of the system and give it a name.
Nintendo chose to call their new home system the "Family Computer", shortened to "Famicom".<Margin id="famicom"><img src={famicom} alt="" width="480" />The Nintendo Famicom.<br>Photo by <a href="https://commons.wikimedia.org/wiki/User:Evan-Amos">Evan Amos</a>.</Margin> Its case was
designed to make it look like a fun toy: red and white, with gold accents. The Famicom had two controllers
hard-wired to the sides of the console, with a 15-pin expansion port on the front. Game cartridges
were inserted vertically into a slot on top of the console.

The Famicom launched in July 1983 to great success, selling 500,000 consoles in two months despite only
having three available games &mdash; Donkey Kong, Donkey Kong Jr., and Popeye. While
Nintendo R&D was not able to hit Yamauchi's ambitious &yen;9,800 target, the
system did sell for &yen;14,800 (equivalent to $65 USD), certainly cheap enough
to appeal to parents.

## An American Renaissance

With its popularity in Japan, bringing the Famicom to the U.S. was a no-brainer. But
the American market was having issues of its own; 1983 was the year of the "Atari Crash"
in the U.S., when retailers abandoned the idea of home video games after overproduction
and a lack of quality control led to massive unsold inventories of Atari 2600 cartridges.
U.S. retailers were not interested in buying inventory of a new video game system.

Nintendo spent two years re-designing the Famicom for a post-video-game market. It
could not look like a video game machine, so its outer casing became a grey rectangle
with a prominent front flap - a move meant to make it look like a VCR. The Famicom's
small, colorful game cartridges became large, grey "Game Paks", mostly containing
empty space but now large (and uniform) enough to bear a passing resemblance to VHS tapes.
Finally, the system needed a name change. "Nintendo Entertainment System" positioned the
system as part of a home theater setup, something that would fit in alongside stereo
equipment.

The re-designed system was almost ready, but Nintendo felt it still needed something unique
to make it a "must-buy" product. The "Deluxe Set" included a "Zapper" light gun, perfect
for shooting games like _Duck Hunt_, and R.O.B., the "Robotic Operating Buddy".<Margin id="r-o-b"><img src={ROB} alt="" width="480" />R.O.B.<br>Photo by <a href="https://commons.wikimedia.org/wiki/User:Evan-Amos">Evan Amos</a>, CC-BY-SA 3.0.</Margin> This was no mere video game system - it came with a _robot!_ The cameras that
formed R.O.B.'s "eyes" could detect coded patterns of flashing light from the TV,
which would instruct R.O.B. to turn left or right or move its arms up or down.
R.O.B. could be used with two games, _Gyromite_ and _Stack-Up_, neither of which were
particularly good. But games were secondary: R.O.B. existed solely to sell the NES
to American parents who had already been burned by the Atari 2600.

There is one more piece of the Famicom's re-branding to discuss before we move on to
programming the hardware. A key cause of the 1983 crash was a lack of quality control
or licensing for Atari 2600 games. Video games were big business, and any company
that could hire a programmer or two wanted to find a way to sell Atari games. The
result was a flood of games that often barely worked. Most consumers, after being
burned a few times by paying full price for terrible games, stopped buying them,
and the video game market imploded.

Desperate to prevent this situation for the NES, Nintendo added a chip to the NES
motherboard called "10NES"<Margin id="cic-10nes"><img src={CIC} alt="" width="480" />The 10NES chip on an NES cartridge.<br>Photo by (you guessed it) <a href="https://commons.wikimedia.org/wiki/User:Evan-Amos">Evan Amos</a>.</Margin> (sometimes referred to as "CIC", for "Checking Integrated
Circuit").
The 10NES chip acted as a cryptographic lock and key. The console and cartridge each had
their own CIC chip; the two chips would each calculate a value based on a specific
algorithm, and the cartridge would send its answer to the console for comparison.
If the results matched, the system would boot as normal. If they did not match,
the CIC chip in the console would reset and try again.<Margin id="cic-resets">Incidentally, this is why you would often have to "blow on the cartridge" to get an NES game to work. If the connectors on the cartridge did not make a secure connection to the console, the 10NES chip would be unable to transmit its code, and it would go into a reset loop. Blowing on the cartridge
actually did nothing; what fixed the problem was removing and re-inserting the cartridge to re-seat the connectors.</Margin> The design
of the 10NES chip as well as the specific algorithm running on it were patented
by Nintendo, meaning that only Nintendo could legally manufacture 10NES chips.
As a result, only Nintendo could manufacture cartridges that would work with
the NES &mdash; unlicensed cartridges would not have the chip, and the NES
console would refuse to boot them. Nintendo would have final say on what games
were released for its platform.

