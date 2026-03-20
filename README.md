# Smart Queue & Live Ticketing System 🎟️

ระบบจัดคิวอัจฉริยะแบบเรียลไทม์ (Smart Queue) ที่ออกแบบมาเพื่อร้านอาหารหรือจุดบริการต่างๆ ลูกค้าสามารถสแกน QR Code เพื่อรับหมายเลขคิว และดูสถานะคิวของตัวเองได้แบบสดๆ (Live) พร้อมระบบแจ้งเตือนเมื่อถึงคิว

## 📌 Features (ระบบการทำงาน)
1. **สำหรับลูกค้า (Customer Flow):**
   - สแกน QR Code หน้าพนักงาน/หน้าร้าน
   - กดรับคิวผ่าน Web App (ไม่ต้องโหลดแอป)
   - ดูสถานะคิวปัจจุบันแบบ Real-time (รออีกกี่คิว)
   - แจ้งเตือนเมื่อใกล้ถึงคิว หรือถึงคิวแล้ว

2. **สำหรับพนักงาน (Staff / Admin Flow):**
   - ดูหน้ารวมคิวทั้งหมด (Dashboard)
   - กดเรียกคิวต่อไป (Call Next)
   - ข้ามคิว (Skip) หรือ จบคิว (Complete)

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (เก็บประวัติคิว, ข้อมูลหลัก)
- **Live State & Pub/Sub:** Redis (จัดการสถานะคิวแบบ Real-time และทำ Pub/Sub แจ้งเตือนลูกค้า)
- **Frontend (Planned):** Next.js / React