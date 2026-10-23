# Dibuja el ícono de la app (micrófono blanco sobre degradado azul → rosa) con Pillow.
# Uso: python tools/iconos.py   (escribe icons/*.png)
import os
from PIL import Image, ImageDraw
D=os.path.join(os.path.dirname(__file__),'..','icons')
def grad(n):
    im=Image.new('RGB',(n,n));px=im.load()
    a=(47,123,255);b=(255,79,163)
    for y in range(n):
        for x in range(n):
            t=min(1,max(0,(x+y)/(2*n)*1.25-.1))
            px[x,y]=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
    return im
def icon(n,pad=0.0,bg=None):
    S=n*4;g=grad(S)
    im=Image.new('RGBA',(S,S),bg or (0,0,0,0))
    m=Image.new('L',(S,S),0);ImageDraw.Draw(m).rounded_rectangle([S*pad,S*pad,S*(1-pad),S*(1-pad)],radius=int(S*(1-2*pad)*.23),fill=255)
    im.paste(g,(0,0),m)
    d=ImageDraw.Draw(im);k=S*(1-2*pad);o=S*pad;w=int(k*.05)
    cx=o+k/2
    d.rounded_rectangle([cx-k*.11,o+k*.18,cx+k*.11,o+k*.58],radius=int(k*.11),fill='white')
    d.arc([cx-k*.2,o+k*.32,cx+k*.2,o+k*.70],0,180,fill='white',width=w)
    d.line([cx,o+k*.70,cx,o+k*.81],fill='white',width=w)
    d.line([cx-k*.11,o+k*.81,cx+k*.11,o+k*.81],fill='white',width=w)
    return im.resize((n,n),Image.LANCZOS)
icon(192).save(os.path.join(D,'icon-192.png'))
icon(512).save(os.path.join(D,'icon-512.png'))
icon(180,0,(0,0,0,255)).convert('RGB').save(os.path.join(D,'apple-touch-icon.png'))
icon(512,.1,(0,0,0,255)).convert('RGB').save(os.path.join(D,'icon-maskable-512.png'))
