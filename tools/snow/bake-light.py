# Dựng lại bản đồ ánh sáng khi tắt đèn của cảnh ngắm tuyết (src/assets/snow-dark-*.webp, snow-warm-*.webp). Cần numpy, opencv-python-headless, pillow. Chạy: python3 tools/snow/bake-light.py
# cut-1/2.png: hình cắt hai người ở hai dáng ngồi (alpha); toạ độ nến, trường sáng LIT, các ô kính: sửa ở đầu tệp nếu đổi ảnh.
import numpy as np, cv2
from PIL import Image
import os; HERE=os.path.dirname(os.path.abspath(__file__)); A=os.path.join(HERE,'..','..','src','assets')+'/'
W,H=836,470
xs=(np.arange(W)+.5)*2; ys=(np.arange(H)+.5)*2
X,Y=np.meshgrid(xs,ys)
flames=[(345,912,1.0),(264,801,.7),(1608,815,1.0)]
LIT=dict(x=760,y=900,rx=880,ry=560)
panes=[(285,0,135,636),(480,0,818,636),(1360,0,262,636)]
pane=np.zeros((H,W),np.float32)
for x,y,w,h in panes: pane[int(y/2):int((y+h)/2), int(x/2):int((x+w)/2)]=1
notpane=1-pane
d_lit=np.sqrt(((X-LIT['x'])/LIT['rx'])**2+((Y-LIT['y'])/LIT['ry'])**2)
e=np.interp(d_lit,[0,.45,.8,1],[.28,.52,.86,1])
cf=np.ones_like(e)
for fx,fy,k in flames:
    r=np.hypot(X-fx,Y-fy); cf*=np.interp(r,[0,200*k,520*k],[.2,.6,1])
F=e*cf
d_patch=np.sqrt(((X-70)/200)**2+((Y-560)/430)**2)
patch=np.interp(d_patch,[0,.55,1],[.9,.65,0])
def over(c1,a1,c2,a2):  # c2,a2 phía trên
    a=a2+a1*(1-a2)
    c=(c2*a2[...,None]+c1*(a1*(1-a2))[...,None])/np.maximum(a,1e-6)[...,None]
    return c,a
for n in ['1','2']:
    sil=cv2.imread(os.path.join(HERE,f'cut-{n}.png'),cv2.IMREAD_UNCHANGED)[...,3].astype(np.float32)/255
    sil=cv2.erode(sil,np.ones((5,5),np.uint8))  # mặt nạ cắt nở ra vài px quanh người: thu về đúng mép thật, không còn quầng tối quanh đầu
    mask=sil+(1-sil)*notpane
    # phòng tối .88; hai người nhẹ hơn (.62) vì mặt lưng quay về phía nến và đồ vật gần máy quay, nên còn thấy được sợi tóc và vân áo
    D=F*(.88*(1-sil)*notpane+.62*sil)
    D=1-(1-D)*(1-patch)
    dark=np.zeros((H,W,4),np.uint8); dark[...,0]=9; dark[...,1]=4; dark[...,2]=2; dark[...,3]=np.clip(D*255,0,255)
    Image.fromarray(dark,'RGBA').save(A+f'snow-dark-{n}.webp',quality=80,method=6)
    # ánh ấm
    cool_a=np.interp(Y,[200,430,640],[.2,.07,0]); cool_c=np.broadcast_to(np.array([150,185,240],np.float32),(H,W,3)).copy()
    ell_a=np.interp(d_lit,[0,.5,1],[.2,.12,0]); ell_c=np.broadcast_to(np.array([255,150,65],np.float32),(H,W,3)).copy()
    cand=[]
    for fx,fy,k in flames:
        r=np.hypot(X-fx,Y-fy); a=np.interp(r,[0,300*k,700*k],[.26*k,.1*k,0]); cand.append(a)
    warm_c=np.array([255,140,60],np.float32)
    # lớp trên người: cool (dưới) -> ellipse -> nến
    c,a=cool_c,cool_a
    c,a=over(c,a,ell_c,ell_a)
    for ca in cand: c,a=over(c,a,np.broadcast_to(warm_c,(H,W,3)).copy(),ca)
    # viền sáng lạnh: ánh tuyết ngoài cửa sổ chiếu vào mặt trước hai người, nên nhìn từ phía sau chỉ thấy một đường sáng mảnh ôm theo đỉnh đầu, tóc và vai (mạnh ở phía trên, mất dần xuống thân)
    e2=cv2.erode(sil,np.ones((5,5),np.uint8)); band=cv2.GaussianBlur(np.clip(sil-e2,0,1),(0,0),.8)  # một đường mảnh ngay trong mép thật
    rim_a=np.clip(band*np.interp(Y,[160,420,660],[.42,.24,0]),0,1)
    rim_c=np.broadcast_to(np.array([150,190,245],np.float32),(H,W,3)).copy()
    c,a=over(c,a,rim_c,rim_a)
    fo=np.interp(Y,[560,696],[1,0]); a1=a*sil*fo; c1=c
    # lớp trên chăn+bàn (toàn chiều ngang): ellipse + nến
    c,a=ell_c,ell_a
    for ca in cand: c,a=over(c,a,np.broadcast_to(warm_c,(H,W,3)).copy(),ca)
    # ánh tuyết ngoài cửa sổ hắt xuống bậu cửa, gối và mặt chăn gần cửa: một dải xanh lạnh nhạt ngay dưới mép kính, rộng bằng khung cửa
    sp_x=np.interp(X,[285,420,1500,1622],[0,1,1,0]); sp_a=np.interp(Y,[636,690,820],[0,.15,0])*sp_x
    sp_c=np.broadcast_to(np.array([140,178,232],np.float32),(H,W,3)).copy()
    fi=np.interp(Y,[560,696],[0,1]); a2=a*fi; c2=c
    c2,a2=over(c2,a2,sp_c,sp_a)
    co,ao=over(c1,a1,c2,a2)
    warm=np.zeros((H,W,4),np.uint8); warm[...,:3]=np.clip(co,0,255); warm[...,3]=np.clip(ao*255,0,255)
    Image.fromarray(warm,'RGBA').save(A+f'snow-warm-{n}.webp',quality=80,method=6)
    print(n,'ok')
