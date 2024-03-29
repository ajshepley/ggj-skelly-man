# How to Update

Using the following order, drag (one at a time) the sprites into [Leshy Tool](https://www.leshylabs.com/apps/sstool/):

* idle01.png, idle02.png, walk01.png, walk02.png, walk03.png, kick01.png, kick02.png, midjab01.png, midjab02.png, uppercut01.png, uppercut02.png, uppercut03.png, hurt01.png, hurt02.png

Download the new spritesheet and name it `skelly_spritesheet.png` in the parent directory. Replace the existing file.

Set Leshy to output `JSON-TP-Array` and then save that file as `skelly_sprites.json` in the parent directory.

## Resizing

Locally, I resize the images using imagemagick's mogrify:

`mogrify -resize 216x216 -quality 100 -path ./resized *.png`

For the patients, the resized sprite size is `162x235`.

Prefer height of 235 in resize: `mogrify -resize x235 -quality 100 -path ./resized *.png`
