import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'public', 'documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const docFiles = [
  'chinh-sach-bao-mat.docx',
  'chinh-sach-gia.docx',
  'chinh-sach-thanh-toan.docx',
  'chinh-sach-van-chuyen-giao-hang.docx',
  'dieu-khoan-su-dung.docx',
  'hinh-thuc-ho-tro-truc-tuyen.docx',
  'quy-trinh-giai-quyet-khieu-nai.docx'
];

docFiles.forEach(file => {
  const filePath = path.join(docsDir, file);
  if (!fs.existsSync(filePath)) {
    // Write placeholder document file
    fs.writeFileSync(filePath, Buffer.from(`Tài liệu chính sách HDS Law: ${file}`));
  }
});

console.log('Document files generated successfully in public/documents/');
