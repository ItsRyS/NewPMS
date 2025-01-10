import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { fabric } from 'fabric';
import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
const PDFAnnotator = ({ pdfUrl }) => {
  const pdfCanvasRef = useRef(null); // สำหรับแสดง PDF
  const overlayCanvasRef = useRef(null); // สำหรับวาดด้วย Fabric.js
  const [fabricCanvas, setFabricCanvas] = useState(null);

  useEffect(() => {
    // ฟังก์ชันสำหรับแสดง PDF บน canvas
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // โหลดหน้าแรก (กรณีที่มีหลายหน้า คุณอาจทำให้เป็น dynamic ได้)
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // สร้าง Fabric.js overlay บน canvas
      const fabricCanvasInstance = new fabric.Canvas(overlayCanvasRef.current, {
        isDrawingMode: true, // เปิดโหมดการวาด
      });
      fabricCanvasInstance.setWidth(viewport.width);
      fabricCanvasInstance.setHeight(viewport.height);
      setFabricCanvas(fabricCanvasInstance);
    };

    renderPDF();
  }, [pdfUrl]);

  // ฟังก์ชันสำหรับบันทึกการวาดเป็นภาพ
  const handleSaveAnnotation = () => {
    if (!fabricCanvas) return;
    const dataUrl = overlayCanvasRef.current.toDataURL();
    console.log('Annotation saved:', dataUrl);
    // คุณสามารถส่ง dataUrl ไปยัง backend เพื่อบันทึกได้
  };

  return (
    <Box sx={{ position: 'relative', width: 'fit-content' }}>
      <canvas ref={pdfCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <canvas ref={overlayCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveAnnotation}>
          บันทึกการแก้ไข
        </Button>
      </Box>
    </Box>
  );
};
PDFAnnotator.propTypes = {
    pdfUrl: PropTypes.string.isRequired,
  };
export default PDFAnnotator;
