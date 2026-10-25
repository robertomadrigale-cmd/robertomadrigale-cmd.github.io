"""Ícono de Om Bajo: fondo verde #34d399 con «om» blanco; la «o» es un anillo con ondas. Uso: python mastil/bajo/tools/iconos.py."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT = Path(__file__).resolve().parent.parent / 'icons'
OUT.mkdir(exist_ok=True)
def icon(size):
    n=1024
    im=Image.new('RGB',(n,n),(52,211,153));d=ImageDraw.Draw(im)
    # degradado suave hacia abajo
    for y in range(n):
        k=y/n*.22
        d.line((0,y,n,y),fill=(int(52*(1-k)),int(211*(1-k)),int(153*(1-k))))
    W=(255,255,255);cx,cy,r=n*.34,n*.56,n*.17
    d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=W,width=int(n*.055))
    for i,rr in enumerate((r*1.45,r*1.85)):
        d.arc((cx-rr,cy-rr,cx+rr,cy+rr),200,250,fill=W+(0,),width=int(n*(.026-i*.008)))
    try:font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',int(n*.5))
    except OSError:font=ImageFont.load_default()
    d.text((n*.53,cy),'m',fill=W,font=font,anchor='lm')
    return im.resize((size,size),Image.Resampling.LANCZOS)
for name,size in [('icon-192',192),('icon-512',512),('apple-touch-icon',180)]:
    icon(size).save(OUT/(name+'.png'))
