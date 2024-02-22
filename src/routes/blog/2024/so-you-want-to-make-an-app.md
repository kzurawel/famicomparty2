---
title: So you want to make an app
date: 2024-02-21
summary: An introduction to cross-platform GUI frameworks.
tags:
  - gui
  - software
---

<script>
  import Margin from "$lib/components/Margin.svelte";
  import Toc from "$lib/components/Toc.svelte";
</script>

<Toc />

A few years ago, I put out a desktop app called NES Lightbox. It was a simple graphics editor for NES games, my first "real" GUI project, and I built it on Electron with plain JavaScript. It did what it was intended to do - you could use it to create basic CHR tiles for a game, and sketch out backgrounds on a canvas and save them out to a file.

Most importantly, it let you do that on Windows, Mac, or Linux. For historical reasons, basically all of the popular tools for NES development are Windows-only (with some also running on Linux); Mac apps are few and far between. NES Lightbox worked well enough, but I stopped focusing on it as I worked more on [the book](https://famicom.party/book) and after a year or so I started getting reports that it no longer worked. Being an Electron app, NES Lightbox was about a 100MB download for what was probably 1MB worth of functionality. Instead of doing the work to "fix" it, I removed it from the site and vowed that I would re-write it. Faster, smaller, better in every way. All I needed was a framework that would let me do that.

Reader, I have spent _three years_ bouncing between frameworks, learning enough to get started and then becoming disillusioned and moving to the next shiny object. I'm going to discuss here all the different frameworks I have tried.

## The first web-based approach: Tauri

[Tauri](https://tauri.app) is a Rust-based framework that uses Web technologies (HTML/CSS/JS) for its UI and Rust for the backend that powers that UI. I really wanted to learn Rust at the time, it was _the future_ with its memory safety by design and deep devotion to keeping the programmer in control of everything at all times.<Margin id="zola">This was also the time that I started migrating the site from plain HTML to [Zola](https://getzola.org), a Rust-based static site generator.</Margin> After using it for a few months, I realized that I don't really like writing Rust code. The tooling is great, but I still find it incredibly fiddly, and I don't want to have to keep everything in my head at all times. That's the framework's job! I just want to build something that works.

Additionally, these "web tech as UI" frameworks, outside of Electron, all start from a place of "JavaScript is bad, you should only use it because you have to". The ideal Tauri (or Wails, etc.) app is almost entirely written on the backend, sharing data to a frontend that is as dumb as possible. If you have a ton of backend experience, that is probably a highly attractive proposition, but for someone like myself who has done mostly frontend work, it's a rough transition. I was constantly trying to figure out where to put a particular piece of state or where to perform a calculation, and it got tiring fast.

## Using a "real framework": PyQt

Back when I used to use Linux,<Margin id="linux">I think I switched from Linux to MacOS around 2009. Before that I had been using Gentoo (sigh) and then that hot new distro, Ubuntu.</Margin> I was a big fan of GNOME and its Gtk framework. I had also spent some time with KDE, and the Qt apps were not always my style but always seemed powerful. When I started looking into cross-platform GUI toolkits that were not based on HTML, I started with those two. Gtk is tightly tied to GNOME, and writing a Gtk app means using a wide range of GNOME-specific libraries that may or may not play nicely on Windows or Mac. Oh, and you need to write the app in C.<Margin id="gtk-c">There are some exceptions; I'll get to them later.</Margin> So, Gtk was out, but Qt was interesting. Qt's native programming language is C++, but it has a number of bindings to other languages, especially Python. I had used Python extensively, it was probably my first "real" programming language, and the idea of using it to make desktop apps was appealing.

PyQt is really two projects: the one that is actually named "PyQt", and the one that is officially supported by Qt, called [PySide](https://doc.qt.io/qtforpython-6/). A lot of people have made a lot of small hobby-ish apps using PyQt, and there is copious documentation out there. It's relatively simple to use PyQt; just import the classes you need for the widgets you want, arrange them in a tree, and run it. This was seriously exciting - you could make something that _felt_ like a native app on each platform, using a pretty simple programming language!

The downside, of course, is that wrapping up a Python program for people who do not already use Python is kind of a nightmare. If you are targeting general users, you need to make sure that they have:

- a working Python installation, of the correct version, and
- their own installation of the Qt libraries.

If you can do that, your PyQt programs will be pretty small - a few MB. If you can't guarantee that, and/or you don't want to have the burden of supporting Python _and_ Qt installs on whatever platform your audience is using, you need to bundle all of that into your app. Which leaves you with an app that is, again, about 100MB for about 1MB worth of functionality.

## How about Go?: Fyne

Focusing on application bundle size and ease of distribution, I looked into Go GUI toolkits. There are many, many options here, but no clear front-runner. You've got a lot of ports of toolkits in other languages ([Giu](https://github.com/AllenDang/giu) for Dear ImgUi, [gotk](https://github.com/diamondburned/gotk4) for Gtk, [therecipe](https://github.com/therecipe/qt) for Qt, etc.), and then there's [Fyne](https://fyne.io). Fyne's guiding ideal is simplicity - it provides you with mechanisms for creating windows and drawing things to the canvas, and then it gets out of your way. At first, this is incredibly freeing. Fyne gives you a very basic set of built-in widgets but also makes it very easy to write your own. All you need to do is specify how a widget should display on screen based on its data, and how it should lay itself out inside of a parent widget. The problem is that you quickly find yourself writing custom widgets for basically everything, and each custom widget needs its own custom layout. It's an enormous burden of samey, boilerplate code every time you decide you need a new widget. There is also zero support for accessibility at the moment; everything is pixels on a canvas, and there are no hooks for assistive technologies.

What really soured me on the project, though, was its community and direction. The Fyne folks love to talk up all of the amazing progress they are making, like "FyneDesk", an entire OS shell where everything is a Fyne app. In reality, there are few apps written in Fyne, and the ones that do exist are incredibly underwhelming. No one seems to have built a large, complex app with Fyne, and given its very low-level focus, I don't know if anyone will anytime soon. A recent "major update" to the platform was the ability to draw rounded rectangles.

On the plus side, because it is built on Go, the resulting binaries are small (~10MB), easy to distribute (just one executable!), and highly performant.

## Another try with Gtk: Vala

At this point I was willing to try anything that I thought would be fun and interesting. I looked into [Vala](https://vala.dev), a language specifically designed for writing Gtk apps that compiles down to C. It's a very nice language, all in all, but it's still hampered by the fact that Gtk realy expects you to be running Gtk applications on GNOME. This extends to the documentation, as well - there is basically nothing out there to help you make a Gtk application on Mac or Windows, and even the documentation for GNOME developers seems to assume that you've been writing code for this platform for years. It's a very large ecosystem, and pieces of it have been swapped out over the years, but it's very hard to get a high-level overview of the whole thing and figure out where to start.

I also, briefly, tried to get into Qt development in C++, but I bounced off of that pretty hard.

## Back to the web: Wails

Around this time, [Wails](https://wails.io) had come out with a new version with some major updates. It's a web-based UI with native backend, like Tauri, but using Go. Binaries are easy to distribute thanks to Go turning everything into a single file, and actual binary sizes are good because Wails uses each platform's native webview instead of bundling one like Electron. If you've got an idea for an app that could make good use of lots of Go code, Wails is my easy recommendation for what to use. My issue, though, was the same one that I had with Tauri: the "right way" to use Wails is to put all of your app logic into the Go backend, and keep the frontend layer as dumb as possible. Ideally, your frontend only calls Go functions, and the backend does work and hands you back the result. This model is just not a great fit for what NES graphics apps need to do - read gestures from the user and make immediate updates to the screen. There are a few operations that could benefit, like rotating an 8x8 tile, but there was a constant uncertainty on my part on where to put my code. I like Wails (more on that in a bit), but I decided to keep looking.

## How about native development?: SwiftUI

I realized that what I really wanted was to make a competent Mac app, since that is the most neglected platform for NES development. SwiftUI has had a few years to bake and it's much nicer than the old Storyboard-based, Objective-C approach, so I figured why not give it a try?

First off: I like SwiftUI a lot. _It's really nice._ If making apps for Apple devices is your bread-and-butter, this is a great way to do that.

But writing apps for SwiftUI has some of the same drawbacks as writing for Gtk. You're working with a platform that is explicitly tied to one OS, and you have to pay the OS manufacturer for the privilege of distributing apps. The community is far larger, and there's no shortage of books and documentation and tutorials out there, but it can still be hard to figure out where to start once you get past the "draw two ovals" part of "drawing the owl". What I found surprising was that even within the platform, there is very little support for making Mac apps unless that is something you have already been doing for years. Nearly all of the documentation, tutorials, etc. focus on iOS apps, relegating Mac development to one chapter near the end that also crams in how to port your app to watches and TVs.<Margin id="electron">This is a major contributor, I think, to the idea that Apple has "given up" on the Mac and ceded the field to web-based cross-platform tech like Electron. Compared to anything web-based, getting into native development is not an easy or friendly process.</Margin>

This got me thinking, though. Sure, there are no good Mac-native solutions for NES development tools, but there are literally _no_ tools available for mobile. Maybe I should check out cross-platform mobile tools?

## The old new kid on the block: Flutter

I had been hearing about [Flutter](https://flutter.dev) for years. It's a cross-platform GUI project built on Dart, a language from Google that was supposed to replace JavaScript, but TypeScript ate its lunch. Flutter is now the only real thing it's good for, and it's pretty compelling. Flutter makes cross-platform mobile apps (i.e. iOS and Android) by treating the host OS as just a canvas and drawing absolutely everything itself. No native widgets, just Flutter widgets styled to look like native on both platforms. The most recent versions of Flutter also allow you to turn your mobile apps into desktop apps from the same codebase, letting you distribute your apps on just about anything.

Flutter really stretches most people's understanding of the word "widget": your entire app is a tree of widgets, and basically anything you might ever want to do to a widget is itself another widget. If you want to add padding to a widget, just wrap it in a Padding widget. Want to listen for taps or mouse clicks? Wrap your widget in a GestureDetector widget. Each of these widgets takes a "child" parameter (or "children", for things like lists), allowing you to nest widgets forever. It's a very simple model to understand, and there are actual useful base widgets for just about anything. SwiftUI does the same thing in a cleaner way, but they're both clearly working off of the same blueprint.

All this nesting comes at a cost, which is code that frequently resembles a "pyramid of doom". Adding new widgets into an existing tree is a matter of first finding the right level to add them and then adjusting all of your ")" and "}" delimiters to match the new structure. Some of those will need to have a comma after them, and some will need a semicolon, since ending a statement with a semicolon is mandatory in Dart. It's a big hassle, and while I really respect the framework it's hard to want to invest in something that is so tightly tied to Google (despite clearly not being its primary focus) and a language that has no good use cases outside of this framework. Dart is Google's Vala. On top of that, the resulting apps have good performance but are still pretty big: ~45MB for a basic Hello World app on desktop.

## The promising newcomer: Compose Multiplatform

Reading reviews and commentary on Flutter, you'll find frequent comparisons to [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) (CM). CM is JetBrains' attempt to turn Jetpack Compose, their UI toolkit for Android, into something that can be used on iOS or desktop as well. This framework is much closer to SwiftUI, with a tree of widgets that can each have their own set of "modifiers" to add padding, change colors, or even do custom drawing, without making a deeply nested widget tree like in Flutter.<Margin id="customdraw">Seriously, Compose Multiplatform's approach to custom drawing is the best I've ever seen. No need to create fiddly Painter objects or manage a pile of canvases; just create a modifier and tell it what you want drawn behind or in front of the widget's "real" content. So simple.</Margin> Plus it runs on top of Kotlin, JetBrains' Java dialect that has become the official language for making Android apps and is increasingly common in backend systems. If Compose Multiplatform falls through, you can still use Kotlin in all sorts of places.

It's a seriously nice framework and I have no doubt that with a few years of polish, it will be a fantastic approach for app development anywhere. As it is, though, it still has some room to grow. CM just hit its first stable release on October 31st, 2023, and that is only for Android and desktop. iOS support is still in alpha status, with a plan to hit beta sometime in 2024. The platform is new enough that it can be hard to find good documentation; I found myself cobbling together notes from Compose Multiplatform itself, Jetpack Compose (which has a nearly identical API, but some features that only apply to Android apps), and Kotlin Multiplatform (the underlying technology that makes it all work). There are no good tutorials or documentation out there yet, which led me to stop digging after a week or two of exploring. Again, I think CM has amazing potential, but it's just not there for me yet.

## Back to the web, again: Ionic

So that's where I am at now: testing out web technology for mobile development using [Ionic](https://ionicframework.com). Ionic basically gives you a collection of web components that mimic native iOS and Android widgets, and runs that code inside of a native app wrapper called Capacitor. The resulting apps are quite small, and due to continuing improvements in iOS and Android browsers, they are very performant. You can use Angular, React, or Vue, and if you're not a fan of the built-in web components, you can use any framework you want inside of Capacitor and have a "native app".

The one weakness is support for desktop; essentially, Ionic will let you compile your app to a Progressive Web App, but to run it with native capabilities on desktop (like being able to modify files on disk or use the user's webcam), Ionic recommends wrapping the PWA with Electron. I feel like that is _not great_, but I'm investigating the possibility of wrapping an Ionic app in something like Wails or Tauri. (We've come full circle now! Yay!)

Is Ionic going to be the solution I go with? I really hope so, if for no other reason than it's been exhausting learning all of these frameworks. So far, I think it meets most of my criteria:

- Cross-platform support (including mobile),
- Small app sizes,
- Ease of distribution (creates single-file app bundles for iOS and Android, and... whatever you can pack your desktop wrapper solution into),
- Great documentation / easy learning curve (it's frontend development, _I know this_),
- Simple mental model (it's just a web app, no awkward server/UI distinction),
- Good performance (browsers do the heavy lifting here), and
- (bonus) Apps made with it look great out-of-the-box.

Whatever happens, I feel like I've learned a lot about graphical app development, and if nothing else I now have plenty of experience to help me evaluate new GUI frameworks.
