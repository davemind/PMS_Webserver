import numpy as np
import cv2

cap = cv2.VideoCapture('rtsp://admin:5500@108.63.13.122:8101/Streaming/Channels/301')

# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'MP4V')
out = cv2.VideoWriter('output.mp4',fourcc, 20.0, (960,480))
if cap.isOpened():
    ret, frame = cap.read()
    if ret==True:
        #frame = cv2.flip(frame,0)
        height, width, channels = frame.shape
        out = cv2.VideoWriter('output.mp4', fourcc, 20.0, (width,height))

while(cap.isOpened()):
    ret, frame = cap.read()
    if ret==True:
        #frame = cv2.flip(frame,0)
        height, width, channels = frame.shape
        print(height)
        print(width)
        # write the flipped frame
        out.write(frame)

        cv2.imshow('frame',frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    else:
        break

# Release everything if job is finished
cap.release()
out.release()
cv2.destroyAllWindows()
