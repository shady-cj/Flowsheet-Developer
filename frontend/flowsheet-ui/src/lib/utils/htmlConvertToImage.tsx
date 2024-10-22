import { toPng } from 'html-to-image';
import { objectDataType } from '@/components/context/ProjectProvider';
// import Report from './report';
// import { renderToStaticMarkup } from 'react-dom/server';
// import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer'

export const htmlToImageConvert = (canvasRef: HTMLDivElement, objectData: objectDataType, pdfUrl: string | null) => {
    // console.log(reportRef.current)
    // generatePDF(reportRef, {filename: 'page.pdf'})
    const [maxWidth, maxHeight] = getMaxWidthAndHeight(objectData) 

    toPng(canvasRef, { cacheBust: false, width: maxWidth + 150, height: maxHeight + 200, style: {background: "white"}})
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("pdf url", pdfUrl)
  };

const getMaxWidthAndHeight = (objectData: objectDataType): [number, number] => {
    let maxWidth = 0, maxHeight = 0;
    for (const key in objectData) {
        let projectedHeight = 0;
        const ALLOWANCE = 20
        const elementType = objectData[key].object!.name
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
