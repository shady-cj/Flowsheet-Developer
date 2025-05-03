import { toPng } from 'html-to-image';
import { objectDataType } from '@/components/context/FlowsheetProvider';
import { updateFlowsheetPreview } from '../actions/flowsheet';
// import logoIcon from "@/assets/logo-icon.svg"
// import Report from './report';
// import { renderToStaticMarkup } from 'react-dom/server';
// import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer'

export const htmlToImageConvert = (canvasRef: HTMLDivElement, objectData: objectDataType, flowsheetName?: string) => {
    // console.log(reportRef.current)
    // generatePDF(reportRef, {filename: 'page.pdf'})
    
    const [maxWidth, maxHeight] = getMaxWidthAndHeight(objectData) 
    console.log("canvas ref",canvasRef)
    // console.log("object data", objectData)
    // console.log(canvasRef)
    // console.log(logo)
    const logo = constructLogoHTMLString(maxHeight)
    canvasRef.insertAdjacentHTML("beforeend", logo)



    // console.log("canvas reference", canvasRef)
    
    // console.log("got here", canvasRef)

    toPng(canvasRef, { cacheBust: true, includeQueryParams:true, width: maxWidth + 150, height: maxHeight + 200, style: {background: "white", zIndex: "-2"} })
    .then((dataUrl) => {
      // console.log("dataURl", dataUrl)
      const link = document.createElement("a");
      link.download = `${flowsheetName || "flowsheet"}.png`;
      link.href = dataUrl;
      link.click();
      
    })
    .catch((err) => {
      console.log(err);
    }).finally(()=> {
      canvasRef.querySelector("#watermark-logo")?.remove()
    });

    
    // console.log("pdf url", pdfUrl)
  };

const getMaxWidthAndHeight = (objectData: objectDataType): [number, number] => {
    let maxWidth = 0, maxHeight = 0;
    for (const key in objectData) {
        let projectedHeight = 0;
        const ALLOWANCE = 20 * objectData[key].scale;
        const heightSpread = 100 * objectData[key].scale;
        const widthSpread = 100 * objectData[key].scale;
        // console.log("object data", objectData[key])
        // console.log(objectData[key].object)

        const elementType = objectData[key].object?.name
        if (elementType === "Text") {
            let numberOfLines = objectData[key].description.match(/<br>/g)?.length
            numberOfLines = numberOfLines === 0 ? 1 : numberOfLines
            projectedHeight = numberOfLines! * 1.3 * 16
        }
        const {lastX, lastY} = objectData[key].properties.coordinates
        if (lastX > maxWidth) maxWidth = Math.floor(lastX + widthSpread) 
        if ((lastY + projectedHeight) > maxHeight) maxHeight = Math.floor(lastY + projectedHeight + heightSpread + ALLOWANCE)

    }
    return [maxWidth, maxHeight]
}


export const previewImageGenerator = async (canvasRef: HTMLDivElement, objectData: objectDataType, flowsheetId: string) => {
  let [maxWidth, maxHeight] = getMaxWidthAndHeight(objectData)
  maxHeight = maxHeight < 280 ? 280 : maxHeight
  maxWidth = maxWidth < 850 ? 850 : maxWidth
  
  toPng(canvasRef, { cacheBust: false, includeQueryParams:true, width: maxWidth + 150, height: maxHeight + 200, style: {background: "transparent"}})
      .then((dataURL) => {
        updateFlowsheetPreview(dataURL, flowsheetId)
      })
      .catch((err) => {
        console.log(err);
      })
}



const constructLogoHTMLString = (maxHeight: number)=> {
  return `
      <div id="watermark-logo" style="position: absolute; z-index: -1; left: 20px; top: ${maxHeight + 100}px; display: flex; align-items: center; gap: 8px;">
        <svg width="24" height="24.75" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="Group 1">
          <rect id="Rectangle 1" y="0.625" width="24" height="24" rx="8" fill="#16191C"/>
          <rect id="Rectangle 2" x="4" y="5.375" width="20" height="20" rx="4" fill="white"/>
          </g>
        </svg>
        <span class="logo-text" style="font-style: italic; color: #1e2179;">ProFlo</span>
      </div>
    `
}