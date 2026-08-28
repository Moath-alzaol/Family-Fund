# رسالة جاهزة لمالك حساب Apple

مرحبًا، أعطيتك صلاحية على مستودع التطبيق لتكمل بناء ورفع نسخة iOS. دورك هو EAS وApple والتوقيع والرفع فقط؛ لا تحتاج دخول Supabase ولا تشغّل أي أمر Supabase.

## 1. نزّل آخر نسخة

```bash
git clone https://github.com/Moath-alzaol/Family-Fund.git
cd Family-Fund
git checkout main
git pull origin main
npm ci
```

إذا كان المستودع موجودًا عندك، نفّذ فقط `git pull origin main` ثم `npm ci`.

## 2. اربط المشروع بـEAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

إذا قال لك EAS إن المشروع مربوط، لا تنشئ مشروعًا جديدًا. إذا عدّل `eas init` إعدادات المشروع وأضاف `projectId`، اعمل commit وارفع التعديل إلى `main`.

## 3. جهز production environment

سأرسل لك بشكل منفصل قيمتين عامتين للتطبيق؛ لا تحتاج حساب Supabase لاستخدامهما:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

أضفهما إلى EAS:

```bash
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_URL --value "القيمة_المرسلة" --visibility plaintext
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "القيمة_المرسلة" --visibility plaintext
npx eas-cli@latest env:list --environment production
```

لا تستخدم أو تطلب `service_role` key أو كلمة مرور قاعدة البيانات.

## 4. ابنِ وارفع التطبيق

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

استخدم حساب Apple المالك عند طلب تسجيل الدخول أو التحقق الثنائي، واسمح لـEAS بإعداد شهادة التوزيع وProvisioning Profile.

## 5. أكمل App Store Connect

بعد انتهاء معالجة الـBuild:

1. افتح التطبيق `صندوق العائلة الذكي` وإصدار iOS 1.0.
2. اختر الـBuild المرفوع في قسم Build.
3. ضع Support URL: `https://family-fund-support.moath-alzaol603707.chatgpt.site#support`.
4. ضع Marketing URL: `https://family-fund-support.moath-alzaol603707.chatgpt.site`.
5. في App Privacy ضع Privacy Policy URL: `https://family-fund-support.moath-alzaol603707.chatgpt.site#privacy`.
6. اترك السعر مجانيًا، والتوفر لكل الدول، والإصدار اليدوي كما هو.
7. راجع حساب App Review المحفوظ داخل App Store Connect، ثم اختر Add for Review عندما تصبح النسخة جاهزة.

App Store Connect App ID: `6806254501`
Bundle ID: `com.family.fund`
