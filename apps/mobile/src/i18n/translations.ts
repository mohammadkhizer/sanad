export type SupportedLanguage = 'en' | 'ar' | 'ur' | 'hi';

export interface Translations {
  // Navigation
  nav_feed: string;
  nav_explore: string;
  nav_live: string;
  nav_inbox: string;
  nav_profile: string;

  // Common Actions
  action_save: string;
  action_cancel: string;
  action_submit: string;
  action_delete: string;
  action_back: string;
  action_next: string;
  action_confirm: string;
  action_apply: string;
  action_report: string;
  action_block: string;
  action_search: string;
  action_refresh: string;

  // Auth
  auth_login_title: string;
  auth_login_subtitle: string;
  auth_register_title: string;
  auth_register_subtitle: string;
  auth_email_label: string;
  auth_password_label: string;
  auth_phone_label: string;
  auth_username_label: string;
  auth_username_checking: string;
  auth_username_available: string;
  auth_username_taken: string;
  auth_username_invalid: string;
  auth_btn_login: string;
  auth_btn_register: string;
  auth_no_account: string;
  auth_have_account: string;
  auth_two_factor_title: string;
  auth_two_factor_desc: string;
  auth_otp_placeholder: string;
  auth_verify_btn: string;

  // Feed & Content
  feed_title: string;
  feed_empty: string;
  feed_reel_tab: string;
  feed_lecture_tab: string;
  post_likes_count: string;
  post_comments_count: string;
  post_share: string;
  post_add_comment: string;
  post_verified_scholar: string;

  // Scholar Verification
  scholar_apply_title: string;
  scholar_apply_subtitle: string;
  scholar_form_degree: string;
  scholar_form_institution: string;
  scholar_form_specialization: string;
  scholar_form_references: string;
  scholar_upload_credentials: string;
  scholar_status_pending: string;
  scholar_status_approved: string;
  scholar_status_rejected: string;

  // Moderation
  moderation_report_title: string;
  moderation_report_desc: string;
  moderation_reason_spam: string;
  moderation_reason_misinformation: string;
  moderation_reason_harassment: string;
  moderation_reason_inappropriate: string;
  moderation_report_success: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    nav_feed: 'Feed',
    nav_explore: 'Explore',
    nav_live: 'Live',
    nav_inbox: 'Inbox',
    nav_profile: 'Profile',

    action_save: 'Save',
    action_cancel: 'Cancel',
    action_submit: 'Submit',
    action_delete: 'Delete',
    action_back: 'Back',
    action_next: 'Next',
    action_confirm: 'Confirm',
    action_apply: 'Apply',
    action_report: 'Report',
    action_block: 'Block',
    action_search: 'Search scholars and topics',
    action_refresh: 'Refresh',

    auth_login_title: 'Welcome Back',
    auth_login_subtitle: 'Sign in to access verified Islamic learning',
    auth_register_title: 'Create Account',
    auth_register_subtitle: 'Join Sanad to learn from trusted scholars',
    auth_email_label: 'Email Address',
    auth_password_label: 'Password',
    auth_phone_label: 'Phone Number',
    auth_username_label: 'Username',
    auth_username_checking: 'Checking availability...',
    auth_username_available: 'Username is available',
    auth_username_taken: 'Username is already taken',
    auth_username_invalid: 'Format must be 3-30 letters, numbers, or underscores',
    auth_btn_login: 'Sign In',
    auth_btn_register: 'Create Account',
    auth_no_account: "Don't have an account? Sign up",
    auth_have_account: 'Already have an account? Sign in',
    auth_two_factor_title: 'Two-Factor Verification',
    auth_two_factor_desc: 'Enter the 6-digit verification code sent to your device',
    auth_otp_placeholder: '000000',
    auth_verify_btn: 'Verify & Continue',

    feed_title: 'Sanad Feed',
    feed_empty: 'No lectures available at this time',
    feed_reel_tab: 'Reels',
    feed_lecture_tab: 'Lectures',
    post_likes_count: 'Likes',
    post_comments_count: 'Comments',
    post_share: 'Share',
    post_add_comment: 'Add a respectful comment...',
    post_verified_scholar: 'Verified Scholar',

    scholar_apply_title: 'Scholar Verification',
    scholar_apply_subtitle: 'Publish your authenticated knowledge on Sanad',
    scholar_form_degree: 'Highest Religious Degree / Ijazah',
    scholar_form_institution: 'Accredited Seminary or University',
    scholar_form_specialization: 'Primary Specialization',
    scholar_form_references: 'Scholarly References and Endorsements',
    scholar_upload_credentials: 'Upload Verified Certificates (PDF/JPEG)',
    scholar_status_pending: 'Application Under Review by Academic Committee',
    scholar_status_approved: 'Verified Scholar Account Active',
    scholar_status_rejected: 'Application Not Approved',

    moderation_report_title: 'Report Content',
    moderation_report_desc: 'Help preserve platform integrity and respectful discourse',
    moderation_reason_spam: 'Commercial spam or duplicate post',
    moderation_reason_misinformation: 'Misattributed quotation or false religious claim',
    moderation_reason_harassment: 'Harassment, hate speech, or abuse',
    moderation_reason_inappropriate: 'Inappropriate or harmful media',
    moderation_report_success: 'Report received. Our moderation team will review it promptly.',
  },

  ar: {
    nav_feed: 'الرئيسية',
    nav_explore: 'استكشاف',
    nav_live: 'البث المباشر',
    nav_inbox: 'الرسائل',
    nav_profile: 'الملف الشخصي',

    action_save: 'حفظ',
    action_cancel: 'إلغاء',
    action_submit: 'إرسال',
    action_delete: 'حذف',
    action_back: 'رجوع',
    action_next: 'التالي',
    action_confirm: 'تأكيد',
    action_apply: 'تقديم الطلب',
    action_report: 'إبلاغ',
    action_block: 'حظر',
    action_search: 'ابحث عن العلماء والموضوعات',
    action_refresh: 'تحديث',

    auth_login_title: 'مرحباً بعودتك',
    auth_login_subtitle: 'سجل الدخول للوصول إلى العلم الشرعي الموثق',
    auth_register_title: 'إنشاء حساب جديد',
    auth_register_subtitle: 'انضم إلى منصة سند لتلقي العلم عن أهله المعتمدين',
    auth_email_label: 'البريد الإلكتروني',
    auth_password_label: 'كلمة المرور',
    auth_phone_label: 'رقم الهاتف',
    auth_username_label: 'اسم المستخدم',
    auth_username_checking: 'جارٍ التحقق من التوفر...',
    auth_username_available: 'اسم المستخدم متاح',
    auth_username_taken: 'اسم المستخدم محجوز مسبقاً',
    auth_username_invalid: 'يجب أن يتراوح الاسم بين 3 و30 حرفاً أو رقماً',
    auth_btn_login: 'تسجيل الدخول',
    auth_btn_register: 'إنشاء الحساب',
    auth_no_account: 'ليس لديك حساب؟ أنشئ حساباً الآن',
    auth_have_account: 'لديك حساب بالفعل؟ سجل الدخول',
    auth_two_factor_title: 'التحقق بخطوتين',
    auth_two_factor_desc: 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى هاتفك',
    auth_otp_placeholder: '000000',
    auth_verify_btn: 'تأكيد ومتابعة',

    feed_title: 'منصة سند',
    feed_empty: 'لا توجد دروس منشورة حالياً',
    feed_reel_tab: 'مقاطع قصيرة',
    feed_lecture_tab: 'دروس ومحاضرات',
    post_likes_count: 'إعجاب',
    post_comments_count: 'تعليق',
    post_share: 'مشاركة',
    post_add_comment: 'أضف تعليقاً لائقاً...',
    post_verified_scholar: 'عالم موثق بسند معتمد',

    scholar_apply_title: 'توثيق حساب عالم',
    scholar_apply_subtitle: 'انشر علمك الموثق والمجاز عبر منصة سند',
    scholar_form_degree: 'أعلى إجازة أو شهادة شرعية',
    scholar_form_institution: 'الجامعة أو المعهد الشرعي',
    scholar_form_specialization: 'التخصص الدقيق',
    scholar_form_references: 'المشايخ والمراجع المعتمدة للتزكية',
    scholar_upload_credentials: 'رفع وثائق الإجازات والشهادات (PDF/JPEG)',
    scholar_status_pending: 'الطلب قيد المراجعة والتدقيق لدى اللجنة العلمية',
    scholar_status_approved: 'الحساب موثق ومعتمد للنشر',
    scholar_status_rejected: 'لم يتم اعتماد الطلب',

    moderation_report_title: 'إبلاغ عن محتوى',
    moderation_report_desc: 'ساعدنا في الحفاظ على رصانة المحتوى والتثبت الشرعي',
    moderation_reason_spam: 'محتوى ترويجي أو مكرر',
    moderation_reason_misinformation: 'حديث غير موثق أو خطأ في النقل الشرعي',
    moderation_reason_harassment: 'إساءة أو جدال مذموم',
    moderation_reason_inappropriate: 'محتوى غير لائق',
    moderation_report_success: 'تم استلام البلاغ وستتم مراجعته بدقة من قبل فريق الرقابة.',
  },

  ur: {
    nav_feed: 'ہوم',
    nav_explore: 'دریافت',
    nav_live: 'براہ راست',
    nav_inbox: 'پیغامات',
    nav_profile: 'پروفائل',

    action_save: 'محفوظ کریں',
    action_cancel: 'منسوخ',
    action_submit: 'جمع کرائیں',
    action_delete: 'حذف کریں',
    action_back: 'واپس',
    action_next: 'اگلا',
    action_confirm: 'تصدیق کریں',
    action_apply: 'درخواست دیں',
    action_report: 'رپورٹ کریں',
    action_block: 'بلاک کریں',
    action_search: 'علماء اور موضوعات تلاش کریں',
    action_refresh: 'تازہ کریں',

    auth_login_title: 'خوش آمدید',
    auth_login_subtitle: 'مستند دینی علوم کے لیے لاگ ان کریں',
    auth_register_title: 'نیا اکاؤنٹ بنائیں',
    auth_register_subtitle: 'سند پلیٹ فارم پر معتبر علماء سے سیکھیں',
    auth_email_label: 'ای میل ایڈریس',
    auth_password_label: 'پاس ورڈ',
    auth_phone_label: 'فون نمبر',
    auth_username_label: 'صارف کا نام',
    auth_username_checking: 'دستیابی کی جانچ ہو رہی ہے...',
    auth_username_available: 'صارف کا نام دستیاب ہے',
    auth_username_taken: 'یہ نام پہلے سے موجود ہے',
    auth_username_invalid: 'نام 3 سے 30 حروف پر مشتمل ہونا چاہیے',
    auth_btn_login: 'لاگ ان کریں',
    auth_btn_register: 'اکاؤنٹ بنائیں',
    auth_no_account: 'اکاؤنٹ نہیں ہے؟ رجسٹریشن کریں',
    auth_have_account: 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں',
    auth_two_factor_title: 'دو فیکٹر تصدیق',
    auth_two_factor_desc: 'اپنے فون پر موصول ہونے والا 6 ہندسوں کا کوڈ درج کریں',
    auth_otp_placeholder: '000000',
    auth_verify_btn: 'تصدیق کریں اور آگے بڑھیں',

    feed_title: 'سند فیڈ',
    feed_empty: 'اس وقت کوئی درس دستیاب نہیں ہے',
    feed_reel_tab: 'مختصر ویڈیوز',
    feed_lecture_tab: 'تفصیلی بیانات',
    post_likes_count: 'پسندیدگیاں',
    post_comments_count: 'تبصرے',
    post_share: 'شیئر کریں',
    post_add_comment: 'شائستہ تبصرہ تحریر کریں...',
    post_verified_scholar: 'سند یافتہ مستند عالم',

    scholar_apply_title: 'عالم کی تصدیق کی درخواست',
    scholar_apply_subtitle: 'سند پلیٹ فارم پر اپنا تصدیق شدہ علمی مواد شائع کریں',
    scholar_form_degree: 'اعلی ترین دینی سند یا اجازت نامہ',
    scholar_form_institution: 'مستند دینی جامعہ یا ادارہ',
    scholar_form_specialization: 'بنیادی علمی تخصص',
    scholar_form_references: 'تزکیہ و تصدیق کے حامل مشائخ',
    scholar_upload_credentials: 'اسناد اور اسناد کے عکس اپلوڈ کریں (PDF/JPEG)',
    scholar_status_pending: 'درخواست علمی کمیٹی کے زیر جائزہ ہے',
    scholar_status_approved: 'تصدیق شدہ اکاؤنٹ فعال ہے',
    scholar_status_rejected: 'درخواست منظور نہیں کی جا سکی',

    moderation_report_title: 'مواد کی رپورٹ کریں',
    moderation_report_desc: 'پلیٹ فارم پر سنجیدہ اور علمی ماحول برقرار رکھنے میں مدد کریں',
    moderation_reason_spam: 'غیر متعلقہ یا تشہیری مواد',
    moderation_reason_misinformation: 'غیر مستند روایت یا غلط دینی حوالہ',
    moderation_reason_harassment: 'بدزبانی، نفرت انگیزی یا ہراسانی',
    moderation_reason_inappropriate: 'نامناسب مواد',
    moderation_report_success: 'رپورٹ موصول ہو گئی۔ نگران ٹیم جلد اس کا جائزہ لے گی۔',
  },

  hi: {
    nav_feed: 'होम',
    nav_explore: 'खोजें',
    nav_live: 'लाइव',
    nav_inbox: 'संदेश',
    nav_profile: 'प्रोफ़ाइल',

    action_save: 'सुरक्षित करें',
    action_cancel: 'रद्द करें',
    action_submit: 'जमा करें',
    action_delete: 'हटाएं',
    action_back: 'वापस',
    action_next: 'आगे',
    action_confirm: 'पुष्टि करें',
    action_apply: 'आवेदन करें',
    action_report: 'रिपोर्ट करें',
    action_block: 'ब्लॉक करें',
    action_search: 'विद्वानों और विषयों को खोजें',
    action_refresh: 'ताज़ा करें',

    auth_login_title: 'वापसी पर स्वागत है',
    auth_login_subtitle: 'प्रामाणिक धार्मिक ज्ञान के लिए साइन इन करें',
    auth_register_title: 'खाता बनाएं',
    auth_register_subtitle: 'सनद से जुड़ें और प्रमाणित विद्वानों से सीखें',
    auth_email_label: 'ईमेल पता',
    auth_password_label: 'पासवर्ड',
    auth_phone_label: 'फ़ोन नंबर',
    auth_username_label: 'उपयोगकर्ता नाम',
    auth_username_checking: 'उपलब्धता की जांच की जा रही है...',
    auth_username_available: 'उपयोगकर्ता नाम उपलब्ध है',
    auth_username_taken: 'यह नाम पहले से उपयोग में है',
    auth_username_invalid: 'नाम 3 से 30 अक्षरों के बीच होना चाहिए',
    auth_btn_login: 'साइन इन करें',
    auth_btn_register: 'खाता बनाएं',
    auth_no_account: 'खाता नहीं है? साइन अप करें',
    auth_have_account: 'पहले से खाता है? साइन इन करें',
    auth_two_factor_title: 'दो-चरणीय सत्यापन',
    auth_two_factor_desc: 'अपने डिवाइस पर भेजा गया 6-अंकीय कोड दर्ज करें',
    auth_otp_placeholder: '000000',
    auth_verify_btn: 'सत्यापित करें और आगे बढ़ें',

    feed_title: 'सनद फ़ीड',
    feed_empty: 'फिलहाल कोई व्याख्यान उपलब्ध नहीं है',
    feed_reel_tab: 'संक्षिप्त रील्स',
    feed_lecture_tab: 'व्याख्यान',
    post_likes_count: 'पसंद',
    post_comments_count: 'टिप्पणियां',
    post_share: 'साझा करें',
    post_add_comment: 'सभ्य टिप्पणी लिखें...',
    post_verified_scholar: 'प्रमाणित विद्वान',

    scholar_apply_title: 'विद्वान सत्यापन',
    scholar_apply_subtitle: 'सनद पर अपना प्रामाणिक ज्ञान प्रकाशित करें',
    scholar_form_degree: 'सर्वोच्च धार्मिक डिग्री या प्रमाण पत्र',
    scholar_form_institution: 'मान्यता प्राप्त मदरसा या विश्वविद्यालय',
    scholar_form_specialization: 'विशेषज्ञता का क्षेत्र',
    scholar_form_references: 'विद्वान संदर्भ और सिफ़ारिशें',
    scholar_upload_credentials: 'प्रमाण पत्र अपलोड करें (PDF/JPEG)',
    scholar_status_pending: 'आवेदन समीक्षाधीन है',
    scholar_status_approved: 'प्रमाणित विद्वान खाता सक्रिय',
    scholar_status_rejected: 'आवेदन स्वीकृत नहीं हुआ',

    moderation_report_title: 'सामग्री की रिपोर्ट करें',
    moderation_report_desc: 'मंच की गरिमा और प्रामाणिकता बनाए रखने में मदद करें',
    moderation_reason_spam: 'अवांछित या दोहराव वाली सामग्री',
    moderation_reason_misinformation: 'गलत संदर्भ या अप्रमाणित दावा',
    moderation_reason_harassment: 'उत्पीड़न या अशोभनीय व्यवहार',
    moderation_reason_inappropriate: 'अनुचित सामग्री',
    moderation_report_success: 'रिपोर्ट प्राप्त हुई। हमारी टीम शीघ्र इसकी समीक्षा करेगी।',
  },
};
