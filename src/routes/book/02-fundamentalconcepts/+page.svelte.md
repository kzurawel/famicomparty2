---
title: 2. Fundamental Concepts
prev:
  url: 01-briefhistory
  title: 1. A Brief History of the NES
next:
  url: 03-gettingstarted
  title: 3. Getting Started
---

<script>
  import Margin from '$lib/components/Margin.svelte';
  import Table from '$lib/components/Table.svelte';
  import Row from '$lib/components/Row.svelte';
  import turtle from './turtlegraphics.jpg?w=480&format=webp';
</script>

What is a computer?

This sounds like a simple question, but it cuts to the heart of what we do as programmers.
For now, let's just say that a "computer" is anything that executes a program. A "program"
is just a series of instructions, and executing a program means starting at the beginning
of the series of instructions and following them one-by-one. (If you read a program and
follow the instructions yourself, congratulations! You are a computer!)

Every computer has a specific set of instructions that it knows how to follow. We call
this set of instructions a computer's _instruction set_ (very creative, I know).
There are a number of ways to represent an instruction set, but for now let's assume
that the instructions in the instruction set are represented by numbers. So, a program
is just a list of numbers, each one defining a certain action to perform. Here's a
hypothetical example instruction set:<Margin id="turtle-graphics"><img src={turtle} alt="A turtle robot" width="480" />This is basically the instruction set for Logo, a "turtle graphics" programming language that lets you direct a robot with a pen to move over a sheet of paper and create interesting designs.<br>Image by Valiant Technology Ltd., CC-BY-SA 3.0.</Margin>

- 1: move forward
- 2: turn left
- 3: turn right

A program running on a computer with this instruction set that moves forward three times,
turns right, moves forward twice, turns left, and moves forward four times would look like this:

```shell
1 1 1 3 1 1 2 1 1 1 1
```

## Working with Data

Often the instructions that the computer needs to execute take some form of _data_ as
well. A common thing that computers do is add numbers together; it is much simpler to have
one instruction that adds rather than a whole set of instructions like this:

- 1: add 1
- 2: add 2
- 3: add 3
- 4: add 4

Or, alternatively, a single "add 1" instruction that you have to call multiple times, which
would be equally difficult to use. A program that adds 1,000 to a number would take 1,000
times as much storage space (and take 1,000 times as long to execute) as a program that just
added 1!

The data that goes with an instruction has to be part of the program, somewhere. Different
programming languages take different approaches to this problem. Some programming languages
require you to keep "code" (instructions) and data completely separate, while others
combine the two. Each approach has its pros and cons, but for now let's look at combined
instructions and data.

For our hypothetical "add some numbers" computer, the instruction set might look like this:

- 1: store next number as "first number"
- 2: add next number to first number, if stored

A program that adds the numbers 2 and 7 would look like this:

```shell
1 2 2 7
```

Stepping through the program one number at a time, we see the instruction "1",
"store the next number as first number". The next number is "2", so 2 is stored as
the first number. We then see the instruction "2", "add next number to first number".
The next number is "7", so our program adds 7 to 2, with the result being 9. Here the
data and instructions are intermixed. Seeing "1 2 2 7", it is impossible to know which
"2"s are the instruction "add next number to first number" and which are the literal
number "2" without starting at the beginning and stepping through the entire program.

Where does the result (9) live? How do we do anything with the result later in our
program? And what does it mean to "store" something?

## Processor Registers

As we have just seen, programs often need a place to temporarily store some data.
Most computers accomplish this by providing _registers_ - small places inside
the processor that can each hold one value.<Margin id="values-are-numbers">"Values" here are really just numbers; as we've done with instructions in the instruction set, we can take any kind of value and represent it with a number as long as we have some kind of mapping between the numbers and the things they represent. As an example, Unicode represents every possible character, from every writing system on Earth, with a 32-bit number. (More on "bits" in just a bit.)</Margin> Registers can be fully generic, or they can be tied to specific kinds of
functionality. The NES' processor, for example, has a register called the _accumulator_,
often abbreviated to "A", that handles all math operations. The 6502's instruction set
has instructions that work like this:

- store next number in accumulator
- add next number to accumulator, result in accumulator
- put number from accumulator somewhere

This solves the problem of where to put numbers and how to access them. But there is
still one open question: when we "put number from accumulator somewhere", where is
"somewhere"? The 6502 in the NES only has three registers, so complicated programs
like games can't use _only_ registers for storing results.

## Memory

Computers make available to programs some amount of (non-permanent) memory to store
things temporarily, allowing the computer to have a small number of (expensive) registers
while still allowing for a reasonable amount of values to be stored outside of the program
itself. This memory is made available as a series of register-sized boxes, each holding one
value and referred to by number. The NES provides your program with two kilobytes (2KB) of
memory space, numbered from zero to 2,047 - a memory space's number is referred to as
its _address_, just like a house number. So, the 6502 instruction set we looked
at above is really more like this:

- store next number in accumulator
- add next number to accumulator, result in accumulator
- put number from accumulator into memory address of next number

## Representing Data

This leads to our final question for this chapter - how are all of these numbers
represented inside the computer?

Up to this point, we have been using "standard", decimal (base 10) numbers. These
are the kinds of numbers that we use every day - numbers like "2" or "7" or "2,048".
Computers, however, operate through electrical currents that can either be "on" or
"off", with no in-between. These currents form the basis of all data inside the
computer, and as a result computers use binary (base 2) numbers.

The smallest unit of information a computer can process is a "bit", or "binary
digit". A bit stores one of two values - 0 or 1, "on" or "off". If we combine
more than one bit as a single number, we can represent a larger range of values.
Two bits, for example, can represent four different values:

```shell
00 01 10 11
```

Three bits let us represent eight different values:

```shell
000 001 010 011 100 101 110 111
```

Each bit we add allows us to represent twice as many values, in the same way
that each decimal digit we add to a decimal number lets us represent ten times
as many values (1 &#8594; 10 &#8594; 100 &#8594; 1,000). Eventually, we reach
eight bits working together to represent a single value, which is so common
that it has its own name: a _byte_. A byte can store one of 256 values.
Since four bits is half of a byte, it is occasionally referred to as a _nybble_,
which is incredibly cute. A nybble can hold one of 16 values.

Computers, including video game consoles, are often described as being a certain
number of bits. Modern desktop/laptop computers are generally "64-bit", older versions
of Windows like Windows XP are called "32-bit operating systems", and the NES is
an "8-bit" system. What all of these are referring to is the _register size_
of the computer - how many bits a single register can hold at one time.<Margin id="address-bus"> Slightly complicating things, the NES' <em>address bus</em> is actually 16 bits wide, meaning the NES can deal with 65,536 different memory addresses instead of just 256. Each memory address still only holds one byte, though.</Margin> Since the NES is an "8-bit" computer, its registers each hold an 8-bit value (one byte). Additionally, each memory address can hold one byte.

How do we work with numbers larger than 255? It is not uncommon for someone playing
_Super Mario Bros._ to get a score in the tens of thousands, far too large
a number to represent in one byte. When we need to represent a value that is
larger than what one byte can hold, we use more than one byte. Two bytes
(16 bits) can hold one of 65,536 different values, and as we add more bytes
our representational power increases sharply. Three bytes can store a value
up to 16,777,215, and four bytes can store a value up to 4,294,967,295. When
we use more than one byte in this way, we are still limited by the register size
of the computer. To work with a 16-bit number on an 8-bit system, we need to
fetch or store the number in two parts - the "low" byte on the right, and the
"high" byte on the left.<Margin id="endianness">Dealing with these larger-than-one-register values is why processors have a defined <em>endianness</em> - i.e., which byte comes first when dealing with large numbers. "Little-endian" processors, like the 6502, take the low byte first followed by the high byte. "Big-endian" processors, like the Motorola 68000, do the opposite, expecting the high byte to come first followed by the low byte. Most modern processors are little-endian, since Intel's hugely popular x86 architecture is little-endian.</Margin>

Since the 6502 that powers the NES works with eight bits of data at a time, smaller
numbers still take eight bits to represent. This can be inefficient, so it is common
to represent multiple smaller values in a single byte when needed. One byte can
hold two four-bit numbers, or four two-bit numbers, or even eight individual
on/off values (we call these "_flags_").

As an example, the byte <code>10110100</code> could represent:

- One 8-bit value: 180
- Two 4-bit values: 11 (`1011`) and 4 (`0100`)
- Four 2-bit values: 2 (`10`), 3 (`11`), 1 (`01`), and 0 (`00`)
- Eight on/off (or true/false) values: on, off, on, on, off, on, off, off
- Any other combination of bit lengths that add up to eight

To help us talk about these multiple-values-in-one-byte scenarios, it's common to number
the bits inside a byte, much like how we can name the "low" and "high" bytes in a
16-bit value. The bit on the far right is "bit 0", and bits count up toward "bit 7"
on the far left. Here's an example:

```shell
byte:  1 0 1 1 0 1 0 0
bit #: 7 6 5 4 3 2 1 0
```

## Making Data Human-Readable

As we have seen, bytes are a very flexible way to represent a variety of
data types in a computer system. The downside of using bytes, though, is
that they are difficult to read. It takes work to see "10110100" and
mentally translate it to the decimal number "180". When an entire program
is represented as a series of bytes, the problem is made exponentially
worse.

To solve this problem, most code is represented as _hexadecimal_ numbers.
"Hexadecimal" is a fancy way of saying "base 16"; a single hexadecimal ("hex")
digit can hold one of sixteen values. Here are the numbers from zero to fifteen
represented in hexadecimal:

```shell
0 1 2 3 4 5 6 7 8 9 a b c d e f
```

Hex notation is useful because a hex digit and a nybble store the same range
of values. This means we can represent a byte using two hex digits, a much
more compact and easy-to-read representation.

<Table columns={["Decimal", "Binary", "Hex"]}>
<Row values={["0", "00000000", "00"]} />
<Row values={["7", "00000111", "07"]} />
<Row values={["31", "00011111", "1f"]} />
<Row values={["94", "01011110", "5e"]} />
<Row values={["187", "10111011", "bb"]} />
<Row values={["255", "11111111", "ff"]} />
</Table>

Dealing with numbers that could be decimal, binary, or hexadecimal can
be confusing. The number "10", for example, represents 10 if it is
decimal, 2 if it is binary, or 16 if it is hexadecimal. To make clear
what value we are referring to, the convention is to use prefixes.
`10` is a decimal number, `%10` is a binary number,
and `$10` is a hexadecimal number.

## Putting It All Together

Now that we've covered a wide range of topics related to how computers
(and programs) work, let's take one more look at the entire process
of what happens when you run a program.

First, the program itself is represented as a series of bytes (what we call
_machine code_). Each byte is either an instruction for the processor,
or a piece of data that goes with an instruction.

The processor starts at the beginning of the program and repeatedly carries
out a three-step process. First, the processor _fetches_ the next
byte from the program. The processor has a special register called the
_program counter_, which keeps track of what byte number of the
program is next. The program counter (or "PC") works together with a
register called the _address bus_, responsible for retrieving
and storing bytes from the program or from memory, to fetch bytes.

Next, the processor _decodes_ the byte it fetched, figuring out
which entry in its instruction set the byte corresponds to (or which instruction
the data byte goes with). Finally, it _executes_ the instruction,
which will make changes to the processor registers or memory. The processor
increments the program counter by one to fetch the next byte of the program,
and the cycle begins again.
