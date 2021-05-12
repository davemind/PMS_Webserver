from flask import Flask, render_template, request, json, session, Response
from responses import error_400_message, error_401_message, error_403_message, success_200_message
import os, cv2, datetime, base64
from datetime import timedelta

app = Flask(__name__)

############################   Camera checking   ############################
class VideoCamera():
	def __init__(self, url):
		self.video = cv2.VideoCapture(url)
		self.url = url
		self.error_count = 0
		
	def __del__(self):
		self.video.release()

	def reset(self):
		self.video.release()
		self.video = cv2.VideoCapture(self.url)
		self.error_count = 0
		
	def get_frame(self):
		success, image = self.video.read()
		#ret, jpeg = cv2.imencode('.jpg', cv2.resize(image, (160, 90)))
		ret, jpeg = cv2.imencode('.jpg', image)
		return jpeg.tobytes()

def gen(camera):
	while True:
		try:
			frame = camera.get_frame()
			camera.error_count=0
		except:
			camera.error_count+=1
			if camera.error_count>5 :
				camera.reset()
				return
			elif camera.error_count>50 :
				ret, jpeg = cv2.imencode('.jpg', cv2.imread('static/images/no connected.jpg'))
				frame = jpeg.tobytes()
			else :
				return
				
		yield (b'--frame\r\n'
			   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed1')
def fr_video_feed1():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed2')
def fr_video_feed2():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed3')
def fr_video_feed3():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed4')
def fr_video_feed4():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed5')
def fr_video_feed5():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed6')
def fr_video_feed6():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed7')
def fr_video_feed7():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed8')
def fr_video_feed8():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed9')
def fr_video_feed9():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed10')
def fr_video_feed10():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed11')
def fr_video_feed11():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed12')
def fr_video_feed12():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  


if __name__ == "__main__":
	app.run(debug=False, host='0.0.0.0', port=5001, threaded=True)
