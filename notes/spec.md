# Typewriter App

## Names

something –writer is clearer
typewriter - obvious but possible
blockwriter - taken
clot - no
roughblot
straightwriter
blotter -
forward -
onwriter -
onwards -
simwriter
unwriter -
inkpage -
blotwriter -
first draft - lame
hammer - 
beatwriter
anvil
immovable
firm
fixwriter
stillwriter
everwriter
permanent
jammed
jamwriter
strike writer
blitz writer
raidwriter
beatwriter
punch writer
bop writer

I actually think people would use this. 

this is not a tool for editing
this is not a tool for formatting
this is not a tool for people who care about word counts
this is a tool for extracting your thoughts and slamming them onto the page, 

If hemingway made software, he would use this.

No sounds. No options. No toggles.

Should be free as in air.

There's a caret but you can't move it with the arrow keys. Somehow change the cursor to something which communicates deletion. You can select text, perhaps even move a pseudo caret for selection purposes with the keyboard. But you cannot change the location for the next input of text.

Always onwards, always forwards.

one press of the key, one character
(you can't hold down key and produce lines of characters)

# homepage

homepage of a beam of light falling on white window (matches os) with text being typed and text particles flying.

# Pick a typeface

Droid sans mono? yes
Source code pro
inconsolata maybe

# Implementation

if you stop typing, perhaps increase the pulse of the caret?

Allow you to save version with and without strikethroughs
Allow you to print version with and without strikethroughs

Rich text makes most sense so strikethroughs can be included

Be able to move selection caret with keys (would look like text selection). Pressing another character except delete would continue typing as normal. 

Is it ok to have two 'carets'? That's weird? It would be nice to not have to use the mouse.

Will need an RTF to HTML parser, html to RTF parser. Can I encode this shit as a text file?

**The goal would be to be able to open the text file in another program and not see the strikethroughs.**

Does the txt format allow for hidden text? Or some markup?

# Issues

Allow selections across multiple lines

Close strike out tags after every deletion, sometimes you can keep typing inside one.

Only strike out text or whitespace between text included in the selection.

**File**
- New
- Open (accepts txt, rtf, md)
- Save (as rtf)

- Export (option to remove strikethrough)
- Move to
- Rename

- Print

**View**
- Full screen
- Night mode