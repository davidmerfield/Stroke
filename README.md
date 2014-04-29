### Typewriter

A text editor with the features of a typewriter. Every keystroke is committed to the page. Deleting text only strikes it out. You can't edit anything. It's silly.

See the [demo here](http://davidmerfield.github.io/typewriter/).

### Signing Mac app

security find-identity

then get the hash stored against 'Developer ID Application'

codesign -s $HASH $PATHTOAPP

verify signing with:

codesign --display --verbose $PATHTOAPP