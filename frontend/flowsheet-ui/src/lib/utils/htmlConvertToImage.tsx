import { toPng } from 'html-to-image';
import { objectDataType } from '@/components/context/FlowsheetProvider';
// import Report from './report';
// import { renderToStaticMarkup } from 'react-dom/server';
// import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer'

export const htmlToImageConvert = (canvasRef: HTMLDivElement, objectData: objectDataType) => {
    // console.log(reportRef.current)
    // generatePDF(reportRef, {filename: 'page.pdf'})
    const [maxWidth, maxHeight] = getMaxWidthAndHeight(objectData) 
    console.log(canvasRef)


    toPng(canvasRef, { cacheBust: false, width: maxWidth + 150, height: maxHeight + 200, style: {background: "white"}})
      .then((dataUrl) => {
        // console.log("dataURl", dataUrl)
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
    // console.log("pdf url", pdfUrl)
  };

const getMaxWidthAndHeight = (objectData: objectDataType): [number, number] => {
    let maxWidth = 0, maxHeight = 0;
    for (const key in objectData) {
        let projectedHeight = 0;
        const ALLOWANCE = 20
        // console.log("object data", objectData[key])
        // console.log(objectData[key].object)

        const elementType = objectData[key].object?.name
        if (elementType === "Text") {
            let numberOfLines = objectData[key].description.match(/<br>/g)?.length
            numberOfLines = numberOfLines === 0 ? 1 : numberOfLines
            projectedHeight = numberOfLines! * 1.3 * 16
        }
        const {lastX, lastY} = objectData[key].properties.coordinates
        if (lastX > maxWidth) maxWidth = Math.floor(lastX)
        if ((lastY + projectedHeight) > maxHeight) maxHeight = Math.floor(lastY + projectedHeight + ALLOWANCE)

    }
    return [maxWidth, maxHeight]
}


export const previewImageGenerator = (canvasRef: HTMLDivElement, objectData: objectDataType) => {
  let [maxWidth, maxHeight] = getMaxWidthAndHeight(objectData)
  let url = null;
  maxHeight = maxHeight < 280 ? 280 : maxHeight
  maxWidth = maxWidth < 850 ? 850 : maxWidth
  
  toPng(canvasRef, { cacheBust: false, width: maxWidth + 150, height: maxHeight + 200})
      .then((dataUrl) => {
        console.log("data url", dataUrl)
        url = dataUrl
      })
      .catch((err) => {
        console.log(err);
      });
  console.log(url)
  // return url
}