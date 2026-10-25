"""Genera los íconos Om Batería con Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
HERE=Path(__file__).resolve().parent; ICONS=HERE.parent/"icons"
ACCENT=(255,90,90,255); GRAPHITE=(12,17,28,255)
RESAMPLE=getattr(Image,"Resampling",Image).LANCZOS
def draw_om(im,box):
    d=ImageDraw.Draw(im,"RGBA");x0,y0,x1,y1=box;k=min(x1-x0,y1-y0);ox,oy=x0+k*.34,y0+k*.5
    for r,w,a in ((.255,.012,54),(.205,.017,112)):
        rr=k*r;d.ellipse((ox-rr,oy-rr,ox+rr,oy+rr),outline=ACCENT[:3]+(a,),width=max(1,int(k*w)))
    r=k*.145;d.ellipse((ox-r,oy-r,ox+r,oy+r),outline=ACCENT,width=max(2,int(k*.055)))
    p=[(x0+k*.54,y0+k*.66),(x0+k*.54,y0+k*.43),(x0+k*.62,y0+k*.37),(x0+k*.69,y0+k*.43),(x0+k*.69,y0+k*.66),(x0+k*.69,y0+k*.43),(x0+k*.77,y0+k*.37),(x0+k*.84,y0+k*.43),(x0+k*.84,y0+k*.66)]
    d.line(p,fill="white",width=max(3,int(k*.058)),joint="curve")
def icon(n,maskable=False):
    s=n*4;im=Image.new("RGBA",(s,s),(0,0,0,0));d=ImageDraw.Draw(im);pad=.10 if maskable else .03
    if maskable:d.rectangle((0,0,s,s),fill=GRAPHITE)
    else:d.rounded_rectangle((0,0,s-1,s-1),radius=int(s*.22),fill=GRAPHITE)
    draw_om(im,(s*pad,s*pad,s*(1-pad),s*(1-pad)));return im.resize((n,n),RESAMPLE)
ICONS.mkdir(parents=True,exist_ok=True)
icon(192).save(ICONS/"icon-192.png");icon(512).save(ICONS/"icon-512.png")
icon(180).convert("RGB").save(ICONS/"apple-touch-icon.png");icon(512,True).convert("RGB").save(ICONS/"icon-maskable-512.png")
