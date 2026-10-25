# Dibuja el ícono de Roka Batería (tambor visto de frente con dos baquetas cruzadas, blanco sobre degradado azul → rosa) con Pillow.
# Uso: python tools/iconos.py   (escribe icons/*.png)
import os
from PIL import Image, ImageDraw
D=os.path.join(os.path.dirname(__file__),'..','icons')
os.makedirs(D,exist_ok=True)
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
    d=ImageDraw.Draw(im);k=S*(1-2*pad);o=S*pad;w=int(k*.055)
    P=lambda x,y:(o+k*x,o+k*y)
    # baquetas cruzadas detrás del tambor
    d.line([P(.18,.14),P(.6,.44)],fill='white',width=w);d.line([P(.82,.14),P(.4,.44)],fill='white',width=w)
    for c in [(.6,.44),(.4,.44)]:
        x,y=P(*c);r=w*.95;d.ellipse([x-r,y-r,x+r,y+r],fill='white')
    # cuerpo del tambor
    d.rounded_rectangle([*P(.16,.5),*P(.84,.84)],radius=int(k*.05),outline='white',width=w)
    d.ellipse([*P(.16,.42),*P(.84,.6)],fill=(255,255,255))
    for x in (.34,.5,.66):
        d.line([P(x,.6),P(x,.8)],fill='white',width=int(w*.7))
    return im.resize((n,n),Image.LANCZOS)
icon(192).save(os.path.join(D,'icon-192.png'))
icon(512).save(os.path.join(D,'icon-512.png'))
icon(180,0,(0,0,0,255)).convert('RGB').save(os.path.join(D,'apple-touch-icon.png'))
icon(512,.1,(0,0,0,255)).convert('RGB').save(os.path.join(D,'icon-maskable-512.png'))
