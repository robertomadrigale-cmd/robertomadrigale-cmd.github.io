"""Genera los íconos Om Guitarra y la imagen social con Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ICONS = HERE.parent / "icons"
ACCENT = (47, 123, 255, 255)
GRAPHITE = (12, 17, 28, 255)
RESAMPLE = getattr(Image, "Resampling", Image).LANCZOS

def draw_om(im, box, accent=ACCENT, white_m=True):
    d = ImageDraw.Draw(im, "RGBA")
    x0, y0, x1, y1 = box
    k = min(x1 - x0, y1 - y0)
    ox, oy = x0 + k * .34, y0 + k * .5
    for radius, width, alpha in ((.255, .012, 54), (.205, .017, 112)):
        r = k * radius
        d.ellipse((ox-r, oy-r, ox+r, oy+r), outline=accent[:3] + (alpha,), width=max(1, int(k*width)))
    r = k * .145
    d.ellipse((ox-r, oy-r, ox+r, oy+r), outline=accent, width=max(2, int(k*.055)))
    path=[(x0+k*.54,y0+k*.66),(x0+k*.54,y0+k*.43),(x0+k*.62,y0+k*.37),(x0+k*.69,y0+k*.43),(x0+k*.69,y0+k*.66),(x0+k*.69,y0+k*.43),(x0+k*.77,y0+k*.37),(x0+k*.84,y0+k*.43),(x0+k*.84,y0+k*.66)]
    d.line(path, fill=(255,255,255,255) if white_m else (255,79,163,255), width=max(3,int(k*.058)), joint="curve")

def icon(n, maskable=False):
    scale=4; s=n*scale
    im=Image.new("RGBA",(s,s),(0,0,0,0));d=ImageDraw.Draw(im)
    pad=.10 if maskable else .03
    if maskable:d.rectangle((0,0,s,s),fill=GRAPHITE)
    else:d.rounded_rectangle((0,0,s-1,s-1),radius=int(s*.22),fill=GRAPHITE)
    draw_om(im,(s*pad,s*pad,s*(1-pad),s*(1-pad)))
    return im.resize((n,n),RESAMPLE)

def font(size, bold=False):
    names=["C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf","DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"]
    for name in names:
        try:return ImageFont.truetype(name,size)
        except OSError:pass
    return ImageFont.load_default()

def social_card():
    im=Image.new("RGB",(1200,630),GRAPHITE[:3]);d=ImageDraw.Draw(im)
    for y in range(630):
        t=y/629;d.line((0,y,1200,y),fill=(int(8+11*t),int(12+8*t),int(22+17*t)))
    glow=Image.new("RGBA",im.size,(0,0,0,0));gd=ImageDraw.Draw(glow)
    gd.ellipse((680,-210,1320,430),fill=(47,123,255,62));gd.ellipse((760,220,1340,800),fill=(255,79,163,50));im=Image.alpha_composite(im.convert("RGBA"),glow)
    draw_om(im,(70,62,350,342),white_m=False);d=ImageDraw.Draw(im)
    d.text((70,360),"Om Guitarra",font=font(72,True),fill="white")
    d.text((73,452),"Centro de aprendizaje musical",font=font(31),fill=(190,198,216))
    base="by AutomaT";f=font(24);d.text((74,520),base,font=f,fill=(190,198,216));x=74+d.textlength(base,font=f);d.text((x,520),"IA",font=f,fill="#2ec4b6")
    im.convert("RGB").save(HERE.parent/"og.jpg",quality=92,optimize=True)

ICONS.mkdir(parents=True,exist_ok=True)
icon(192).save(ICONS/"icon-192.png")
icon(512).save(ICONS/"icon-512.png")
icon(180).convert("RGB").save(ICONS/"apple-touch-icon.png")
icon(512,True).convert("RGB").save(ICONS/"icon-maskable-512.png")
social_card()
