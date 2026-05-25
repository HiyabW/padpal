export async function compareFaces(realTimePhoto, identificationPhoto, setFacialVerificationLoading) {
  if (!realTimePhoto || !identificationPhoto) return 0;

  setFacialVerificationLoading(true);
  const faceapi = await import('face-api.js');
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);

  const img1 = await faceapi.fetchImage(realTimePhoto);
  const img2 = await faceapi.fetchImage(identificationPhoto);

  const detections1 = await faceapi
    .detectAllFaces(img1)
    .withFaceLandmarks()
    .withFaceDescriptors();
  const detections2 = await faceapi
    .detectAllFaces(img2)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections1.length > 0 && detections2.length > 0) {
    const descriptor1 = detections1[0].descriptor;
    const descriptor2 = detections2[0].descriptor;
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

    const result = distance < 0.6 ? 2 : 1;
    if (result) {
      setFacialVerificationLoading(false);
    }

    return result;
  }

  setFacialVerificationLoading(false);
  return -1;
}
