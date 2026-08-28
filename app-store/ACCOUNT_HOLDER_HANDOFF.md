# تسليم مالك حساب Apple Developer

هذا الملف مخصص لمالك حساب Apple Developer أو مستخدم مدعو بصلاحية تسمح بإنشاء بيانات التوقيع ورفع نسخ iOS.

## ما تم تجهيزه

- Bundle ID: `com.family.fund`
- App Store Connect App ID: `6806254501`
- Version: `1.0.0`
- iOS build number الابتدائي: `1`
- ملف `eas.json` يحتوي على إعداد production مع الزيادة التلقائية لرقم البناء وربط App Store Connect ID.
- التطبيق يصرّح بأنه لا يستخدم تشفيرًا غير معفى عبر `usesNonExemptEncryption: false`.

## أوامر البناء والرفع

نفّذ الأوامر التالية من جذر المشروع:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

إذا كان المشروع مربوطًا مسبقًا بمشروع EAS، تجاوز أمر `init`. أثناء البناء سيطلب EAS تسجيل دخول Apple والتحقق الثنائي عند الحاجة، ثم إعداد شهادة التوزيع وملف Provisioning Profile. يجب أن ينفّذ هذه الخطوات مالك الحساب أو مستخدم Apple مخوّل.

يمكن اختصار آخر خطوتين بعد التأكد من صحة بيانات التوقيع باستخدام:

```bash
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

## بعد وصول النسخة إلى App Store Connect

1. انتظر انتهاء معالجة البناء في App Store Connect.
2. افتح إصدار iOS رقم `1.0` وحدد البناء الجديد من قسم **Build**.
3. أجب عن أسئلة Export Compliance إن ظهرت؛ إعداد المشروع يصرّح باستخدام التشفير القياسي المعفى فقط.
4. اختبر حساب المراجعة المحفوظ في App Store Connect وتأكد أنه غير منتهي ويحتوي بيانات تجريبية.
5. تأكد أن حذف الحساب والبيانات متاح داخل التطبيق إذا اعتبرت Apple أن المستخدم يستطيع إنشاء حساب؛ رابط الدعم وحده قد لا يكفي لهذه الحالة.
6. راجع كل البيانات ثم اضغط **Add for Review** فقط عند جاهزية النسخة وبموافقة مالك الحساب.
7. بعد إرسال التطبيق للمراجعة، قدّم طلب **Unlisted App Distribution** لأن التطبيق مخصص لمجموعة عائلية مدعوة.

## حدود هذه المرحلة

- لم يتم إنشاء شهادة توزيع أو Provisioning Profile.
- لم يتم رفع ملف IPA أو اختيار Build داخل App Store Connect.
- لم يتم الضغط على **Add for Review** أو إرسال التطبيق للمراجعة.
- كلمة مرور حساب المراجعة غير مكتوبة في هذا الملف؛ هي محفوظة داخل App Store Connect فقط.
