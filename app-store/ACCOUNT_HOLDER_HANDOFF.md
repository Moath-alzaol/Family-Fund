# تسليم مالك حساب Apple Developer

هذا الملف مخصص لمالك حساب Apple Developer أو مستخدم مدعو بصلاحية تسمح بإنشاء بيانات التوقيع ورفع نسخ iOS. دوره محصور في Apple/EAS والتوقيع والرفع؛ لا يحتاج حسابًا أو صلاحيات أو دخولًا إلى Supabase.

## ما تم تجهيزه

- Bundle ID: `com.family.fund`
- App Store Connect App ID: `6806254501`
- Version: `1.0.0`
- iOS build number الابتدائي: `1`
- ملف `eas.json` يحتوي على إعداد production مع الزيادة التلقائية لرقم البناء وربط App Store Connect ID.
- التطبيق يصرّح بأنه لا يستخدم تشفيرًا غير معفى عبر `usesNonExemptEncryption: false`.

## أوامر البناء والرفع

### 1. تنزيل المشروع

```bash
git clone https://github.com/Moath-alzaol/Family-Fund.git
cd Family-Fund
git checkout main
git pull origin main
npm ci
```

إذا كان المشروع موجودًا مسبقًا، يكفي الدخول إلى المجلد وتشغيل `git pull origin main` ثم `npm ci`.

### 2. ربط EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

إذا ظهر أن المشروع مربوط مسبقًا بـEAS، لا تنشئ مشروعًا ثانيًا. إذا أضاف `eas init` قيمة `extra.eas.projectId` إلى إعدادات Expo، اعمل commit وارفعه إلى `main` لأن لديك صلاحية على الـrepo.

### 3. التأكد من متغيرات بناء production

التطبيق يحتاج قيمتي التشغيل العامتين التاليتين داخل بيئة EAS المسماة `production`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

هذه القيم جزء من تطبيق العميل وليست صلاحية Supabase إدارية. يحصل المالك على القيم من مطور التطبيق دون دخول Supabase، ثم يضيفها إلى EAS بالأوامر التالية:

```bash
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_URL --value "VALUE_FROM_DEVELOPER" --visibility plaintext
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "VALUE_FROM_DEVELOPER" --visibility plaintext
npx eas-cli@latest env:list --environment production
```

لا تستخدم `service_role` key هنا. المطلوب فقط المفتاح العام `anon` المستخدم أصلًا داخل تطبيق الهاتف.

### 4. بناء ورفع iOS

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

أثناء البناء سيطلب EAS تسجيل دخول Apple والتحقق الثنائي عند الحاجة، ثم إعداد شهادة التوزيع وملف Provisioning Profile. يجب أن ينفّذ هذه الخطوات مالك الحساب أو مستخدم Apple مخوّل.

لا تشغّل أي أمر `supabase`، ولا تطلب Supabase Dashboard، ولا تستلم `service_role` key أو كلمة مرور قاعدة البيانات. أي migration أو إعداد backend هو مسؤولية مطور التطبيق/مسؤول Supabase وليس مالك Apple. أوامر `eas env:set` أعلاه تخص منصة Expo للبناء ولا تمنح دخولًا إلى Supabase.

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
