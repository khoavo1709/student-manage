# Student Management System - Planning

## Muc tieu
Website quan ly hoc sinh, dung noi bo/1 nguoi dung, fullstack 1 repo.

## Tech Stack
- Frontend: React (Vite) + TailwindCSS + TypeScript
- Backend: Express + TypeScript (serve ca API lan React build)
- Database: PostgreSQL (Neon free tier) qua Prisma ORM
- Auth: Login don gian, 1 tai khoan admin, JWT
- Deploy: Render (free tier), 1 service duy nhat, auto-deploy khi push GitHub

## Kien truc
- Repo dang npm workspaces: root package.json + client/ + server/
- Backend theo MVC: models (Prisma) - controllers - routes - services
- Frontend: pages/ + components/ + hooks/ (goi API) + services/ (axios)

## Cac trang (5 trang chinh + Login)
- Login
- Dashboard (tong quan: so hoc sinh, so lop, hoc phi chua thu...)
- Students (list + Student Detail voi tabs: Thong tin | Diem so | Bai tap | Nhan xet | Hoc phi)
- Classes (list + Class Detail: ds hoc sinh + Lich hoc cua lop)
- Subjects (CRUD ten mon hoc don gian)
- Lich hoc / Schedule (thoi khoa bieu theo lop)
- Hoc phi (list, loc theo thang/lop/hoc sinh)
- Bao cao (tong hop diem theo lop/mon, thong ke hoc phi theo thang)

## Prisma Schema (draft)
```prisma
model Student {
  id          Int       @id @default(autoincrement())
  fullName    String
  dateOfBirth DateTime
  gender      String
  phone       String?
  address     String?
  classId     Int?
  class       Class?    @relation(fields: [classId], references: [id])
  scores      Score[]
  homeworks   Homework[]
  remarks     Remark[]
  tuitions    Tuition[]
  createdAt   DateTime  @default(now())
}

model Class {
  id        Int        @id @default(autoincrement())
  name      String
  students  Student[]
  schedules Schedule[]
  createdAt DateTime   @default(now())
}

model Subject {
  id        Int        @id @default(autoincrement())
  name      String
  scores    Score[]
  homeworks Homework[]
  schedules Schedule[]
}

model Score {
  id        Int      @id @default(autoincrement())
  studentId Int
  student   Student  @relation(fields: [studentId], references: [id])
  subjectId Int
  subject   Subject  @relation(fields: [subjectId], references: [id])
  value     Float
  date      DateTime
  note      String?
}

model Homework {
  id        Int      @id @default(autoincrement())
  studentId Int
  student   Student  @relation(fields: [studentId], references: [id])
  subjectId Int
  subject   Subject  @relation(fields: [subjectId], references: [id])
  title     String
  status    String   // "chua nop" | "da nop" | "tre han"
  dueDate   DateTime
}

model Remark {
  id        Int      @id @default(autoincrement())
  studentId Int
  student   Student  @relation(fields: [studentId], references: [id])
  content   String
  date      DateTime @default(now())
}

model Tuition {
  id        Int       @id @default(autoincrement())
  studentId Int
  student   Student   @relation(fields: [studentId], references: [id])
  amount    Float
  year      Int
  month     Int       // 1-12
  status    String    // "da dong" | "chua dong"
  paidDate  DateTime?

  @@unique([studentId, year, month])
}

model Schedule {
  id        Int     @id @default(autoincrement())
  classId   Int
  class     Class   @relation(fields: [classId], references: [id])
  subjectId Int
  subject   Subject @relation(fields: [subjectId], references: [id])
  dayOfWeek Int     // 0=CN, 1=Thu2, ... 6=Thu7
  startTime String  // "07:30"
  endTime   String  // "09:00"
}

model Admin {
  id       Int    @id @default(autoincrement())
  username String @unique
  password String // hashed (bcrypt)
}
```

## Lo trinh setup (6 buoc)
1. Khoi tao repo & npm workspace (root package.json, client/, server/, .gitignore)
2. Backend: init Express+TS, Prisma schema, migrate, CRUD routes/controllers, auth JWT, serve static build
3. Frontend: init Vite+React+TS, config Tailwind, React Router cho tung trang, services/hooks goi API
4. Chay thu local (dev mode, 2 port song song), test luong chinh end-to-end
5. Chuan bi deploy: build script, tao Neon Postgres (DATABASE_URL), tao Render service, set env vars, connect GitHub auto-deploy
6. Test lai tren production, seed du lieu mau de demo

## Luu y
- Render free tier: service "ngu" sau ~15 phut khong traffic, lan truy cap dau tien sau do cham (~30-50s) - chap nhan duoc vi dung noi bo/1 nguoi.
- Du lieu theo ngay thang nam, khong tach nam hoc/hoc ky rieng (loc theo khoang ngay khi can bao cao theo ky).
