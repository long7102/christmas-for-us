import cv2, numpy as np, json, sys
A='/home/user/christmas-for-us/src/assets/'
def run(name, ox, oy, rect, fg, bg, tag):
    im=cv2.imread(A+name); H,W=im.shape[:2]
    x0,y0,x1,y1=rect
    m=np.full((H,W),cv2.GC_BGD,np.uint8)
    m[y0:y1,x0:x1]=cv2.GC_PR_BGD
    for x,y,*rr in fg:
        r=rr[0] if rr else 10
        cv2.circle(m,(x+ox,y+oy),r,cv2.GC_FGD,-1)
    for x,y,*rr in bg:
        r=rr[0] if rr else 12
        cv2.circle(m,(x+ox,y+oy),r,cv2.GC_BGD,-1)
    b=np.zeros((1,65));f=np.zeros((1,65))
    cv2.grabCut(im,m,None,b,f,8,cv2.GC_INIT_WITH_MASK)
    o=((m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD)).astype(np.uint8)*255
    o=cv2.morphologyEx(o,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8),iterations=2)
    o=cv2.morphologyEx(o,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    nl,lab,st,_=cv2.connectedComponentsWithStats(o); j=1+np.argmax(st[1:,4]); o=((lab==j)*255).astype(np.uint8)
    o[:, rect[2]+2:]=0
    cs,_=cv2.findContours(o,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea)
    filled=np.zeros_like(o); cv2.drawContours(filled,[c],-1,255,-1)
    ap=cv2.approxPolyDP(c,2.0,True)[:,0,:]
    cv2.imwrite(f'lamp-{tag}.png',filled)
    ov=im.copy(); ov[filled>0]=(ov[filled>0]*.5+np.array([0,0,255])*.5).astype(np.uint8)
    cv2.imwrite(f'lampov-{tag}.png',ov[oy:oy+rect[3]-oy+20, 0:260] if False else ov)
    bx,by,bw,bh=cv2.boundingRect(c); print(tag,len(ap),(bx,by,bw,bh))
    return ap.tolist(), filled
# land: crop origin (0,60)
land,fl=run('cats-land.webp',0,60,(0,100,156,454),[(75,190),(60,320),(65,40),(70,120),(70,330),(25,150),(120,150)],[(200,60),(215,200),(150,20),(200,300),(200,350,14),(190,372,10),(165,350,8),(20,402,8),(70,404,8),(120,402,8),(200,402,10)],'land')
port,fp=run('cats-port.webp',0,230,(0,285,122,590),[(60,200),(55,120),(55,50),(55,310),(20,150),(95,150)],[(170,80),(170,200),(110,20),(160,300),(170,318,10),(170,340,8),(130,330,6),(40,372,8),(100,372,8),(180,372,10)],'port')
json.dump({'land':land,'port':port},open('lamp.json','w'))
def crop(tag,box,out):
    ov=cv2.imread(f'lampov-{tag}.png'); cv2.imwrite(out,ov[box[1]:box[3],box[0]:box[2]])
crop('land',(0,100,260,470),'lampc-land.png'); crop('port',(0,280,240,600),'lampc-port.png')
