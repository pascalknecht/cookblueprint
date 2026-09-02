CookingBlueprint — animated splash assets

Ground  #241C16 (fill the whole screen; matches the app icon ground)
Rust    #C4562F
Cream   #F6EFE8
Track   #3E332C

mark.svg              full Pot + calendar, one flat layer
layers/pot.svg        pot only (lid, rim, handles, body)
layers/badge.svg      calendar card + ink keyline, no check
layers/check.svg      the check stroke alone, for a draw-on
layers/steam.svg      three curls, sits 30px above the mark, centred
layers/spinner-*.svg  track ring and 90-degree arc, rotate the arc only
png/                  transparent rasters at @1x/@2x/@3x
                      mark 146pt · spinner 24pt

Timeline
0ms      ground visible, everything else at 0 opacity
0-620    mark: opacity 0 to 1, translateY 14 to 0, scale 0.94 to 1
         cubic-bezier(.32,.72,0,1)
280-950  wordmark + tagline: opacity 0 to 1, translateY 8 to 0, ease
500+     steam: 2600ms loop, opacity 0 / 0.9 / 0, translateY 6 to -10, ease-in-out
600+     spinner arc: 900ms linear rotate, infinite
exit     cross-fade the whole screen out over 240ms once the week has loaded

If the check is animated separately, hold layers/badge.svg from 0ms and draw
layers/check.svg from 620-880ms (stroke-dashoffset, length 10.4 units).
Wordmark is live text: Rethink Sans ExtraBold, 29px, -0.03em, #F6EFE8.
