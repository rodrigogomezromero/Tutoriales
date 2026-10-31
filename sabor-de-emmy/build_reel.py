import subprocess, sys, os
U="/root/.claude/uploads/4a696dda-e87c-5cdd-83e6-99aad75f4d03/"
S="/tmp/claude-0/-home-user-Tutoriales/4a696dda-e87c-5cdd-83e6-99aad75f4d03/scratchpad/frames/"
OUT=sys.argv[1]; AUDIO=sys.argv[2]
B="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
X=0.4  # crossfade
# (imagen, inicio, fin, texto, zoom_in)
segs=[("96a0989f",0.0,2.3,"¿Ya conoces\nEl Sabor de Emmy?",1),
      ("01af0614",2.3,4.2,"Antojitos regionales\nen Chetumal",0),
      ("6a24ef53",4.2,6.2,"",1),
      ("af9c2ebb",6.2,7.7,"Para compartir",0),
      ("a23bdf6e",7.7,9.2,"Sabores tradicionales",1),
      ("59d00b38",9.2,11.0,"Bebidas refrescantes",0),
      ("f8060348",11.0,13.0,"Descubre su\nmenú digital",1),
      ("ae7a02fd",13.0,14.6,"",0),
      ("68656bfa",14.6,16.8,"Elige tu\npróximo antojo",1),
      ("9bd3bd5c",16.8,21.5,"",1)]
FPS=30
clips=[]
for i,(img,a,b,txt,zin) in enumerate(segs):
    d=(b-a)+(X if i<len(segs)-1 else 0)
    n=int(round(d*FPS))
    comp=S+f"c{i}.png"
    # fondo desenfocado + imagen ajustada (2x para zoom suave)
    subprocess.run(["ffmpeg","-y","-v","error","-i",U+img+"-image.jpg","-filter_complex",
      "[0]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,boxblur=40:2,eq=brightness=-0.08[bg];"
      "[0]scale=2160:3840:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2",
      "-frames:v","1",comp],check=True)
    z = f"1+0.08*on/{n}" if zin else f"1.08-0.08*on/{n}"
    vf=f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1080x1920:fps={FPS},format=yuv420p"
    if txt:
        for k,ln in enumerate(txt.split("\n")):
            tf=S+f"t{i}_{k}.txt"; open(tf,"w").write(ln)
            vf+=(f",drawtext=fontfile={B}:textfile={tf}:fontsize=78:fontcolor=white:"
                 f"box=1:boxcolor=0xB5651D@0.85:boxborderw=24:x=(w-text_w)/2:y={1500+k*122}:"
                 f"alpha='if(lt(t,0.25),t/0.25,1)'")
    if i==len(segs)-1:
        for k,(t,fs,y,st) in enumerate([("El Sabor de Emmy",96,1380,0.3),
                                        ("Encuentra su menú en el",56,1560,1.6),
                                        ("enlace de nuestro perfil",56,1640,1.6),
                                        ("Chetumal, Q. Roo",44,1760,2.4)]):
            tf=S+f"e{k}.txt"; open(tf,"w").write(t)
            box="box=1:boxcolor=0xB5651D@0.9:boxborderw=24:" if k==0 else "shadowcolor=black@0.7:shadowx=3:shadowy=3:"
            vf+=(f",drawtext=fontfile={B}:textfile={tf}:fontsize={fs}:fontcolor=white:{box}"
                 f"x=(w-text_w)/2:y={y}:alpha='if(lt(t,{st}),0,min(1,(t-{st})/0.4))'")
        vf+=f",fade=t=out:st={d-0.6}:d=0.6"
    clip=S+f"v{i}.mp4"
    subprocess.run(["ffmpeg","-y","-v","error","-loop","1","-i",comp,"-vf",vf,"-frames:v",str(n),
                    "-c:v","libx264","-preset","medium","-crf","18","-r",str(FPS),clip],check=True)
    clips.append((clip,d))
# encadenar con xfade
inp=[]; 
for c,_ in clips: inp+=["-i",c]
inp+=["-i",AUDIO]
fc=""; prev="[0:v]"; acc=clips[0][1]
for i in range(1,len(clips)):
    off=acc-X
    fc+=f"{prev}[{i}:v]xfade=transition=fade:duration={X}:offset={off:.3f}[x{i}];"
    prev=f"[x{i}]"; acc=off+clips[i][1]
na=len(clips)
fc+=f"[{na}:a]adelay=150|150,apad,afade=t=out:st={acc-0.5}:d=0.5[a]"
subprocess.run(["ffmpeg","-y","-v","error",*inp,"-filter_complex",fc,"-map",prev,"-map","[a]",
  "-t",f"{acc:.3f}","-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
  "-c:a","aac","-b:a","192k","-movflags","+faststart",OUT],check=True)
print("ok",acc)
