const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// هنا نقوم بجلب مفتاح فايربيس السري من مكان آمن (خزنة السيرفر)
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// هذا هو الرابط الذي سيكلمه تطبيق فلاتر
app.post('/api/send', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  // التحقق من أن الطلب قادم من تطبيقك أنت فقط
  if (apiKey !== 'fcs6_secret_2026') {
    return res.status(401).json({ error: 'غير مصرح لك' });
  }

  const { tokens, title, body } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).json({ error: 'لا توجد هواتف لإرسال الإشعار لها' });
  }

  try {
    const message = {
      notification: { title, body },
      tokens: tokens,
    };
    
    // إرسال الإشعار لجميع اللاعبين دفعة واحدة!
    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('خطأ في الإرسال:', error);
    res.status(500).json({ error: 'فشل الإرسال' });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ سيرفر FC-S6 يعمل بنجاح على بورت ${PORT}`);
});