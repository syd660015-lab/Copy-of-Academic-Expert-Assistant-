
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const generateNormalData = () => {
  const data = [];
  for (let x = -4; x <= 4; x += 0.1) {
    const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(x, 2));
    data.push({
      x: x.toFixed(1),
      y: y,
      label: `Z = ${x.toFixed(1)}`
    });
  }
  return data;
};

export const MeasurementView: React.FC = () => {
  const data = generateNormalData();

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
      <section className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 academic-font mb-6 border-r-4 border-indigo-600 pr-4">
          تمثيل المنحنى الاعتدالي (The Normal Curve)
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          في القياس النفسي الحديث، نعتمد على المنحنى الاعتدالي لتوزيع القدرات والسمات النفسية. يتميز المنحنى بأن المتوسط والوسيط والمنوال يتطابقون في المركز.
        </p>

        <div className="h-80 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="x" hide />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => value.toFixed(4)}
                labelStyle={{ direction: 'ltr' }}
              />
              <ReferenceLine x="0" stroke="#4f46e5" strokeWidth={2} label={{ position: 'top', value: 'المتوسط (Mean)', fill: '#4f46e5', fontSize: 12 }} />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke="#4f46e5" 
                fill="#818cf8" 
                fillOpacity={0.3} 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-bold text-indigo-900 mb-1">الدرجة المعيارية (Z-Score)</h4>
            <p className="text-xs text-indigo-600" dir="ltr">{'Z = (X - μ) / σ'}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-bold text-indigo-900 mb-1">ثبات الاختبار (Reliability)</h4>
            <p className="text-xs text-indigo-600">اتساق النتائج عند تكرار التطبيق</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-bold text-indigo-900 mb-1">الصدق (Validity)</h4>
            <p className="text-xs text-indigo-600">قدرة الاختبار على قياس ما وضع لأجله</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden">
        <h2 className="text-2xl font-bold academic-font mb-6 border-r-4 border-indigo-400 pr-4">مستويات القياس النفسي (Levels of Measurement)</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="py-4 px-6 font-bold text-indigo-300 border-b border-slate-700">المستوى (بالعربية)</th>
                <th className="py-4 px-6 font-bold text-indigo-300 border-b border-slate-700">English Term</th>
                <th className="py-4 px-6 font-bold text-indigo-300 border-b border-slate-700">الخصائص المميزة</th>
                <th className="py-4 px-6 font-bold text-indigo-300 border-b border-slate-700">أمثلة تطبيقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-bold text-indigo-100">الاسمي</td>
                <td className="py-4 px-6 font-sans text-indigo-400 tracking-wide font-medium uppercase text-sm">Nominal</td>
                <td className="py-4 px-6 text-slate-300 text-sm">التصنيف النوعي وتوزيع الأرقام كرموز فقط بدون قيمة حسابية.</td>
                <td className="py-4 px-6 text-slate-300 text-sm italic">الجنس، التخصصات الجامعية، أرقام لاعبي الكرة.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-bold text-indigo-100">الرتبي</td>
                <td className="py-4 px-6 font-sans text-indigo-400 tracking-wide font-medium uppercase text-sm">Ordinal</td>
                <td className="py-4 px-6 text-slate-300 text-sm">ترتيب المفردات تصاعدياً أو تنازلياً دون تحديد المسافات بدقة.</td>
                <td className="py-4 px-6 text-slate-300 text-sm italic">ترتيب الأوائل، المستويات الاقتصادية، الرتب العسكرية.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-bold text-indigo-100">الفئوي (المسافات)</td>
                <td className="py-4 px-6 font-sans text-indigo-400 tracking-wide font-medium uppercase text-sm">Interval</td>
                <td className="py-4 px-6 text-slate-300 text-sm">مسافات متساوية بين الدرجات، وجود صفر افتراضي (ليس انعداماً).</td>
                <td className="py-4 px-6 text-slate-300 text-sm italic">درجة الحرارة، اختبارات الذكاء (IQ)، مقياس ليكرت.</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-bold text-indigo-100">النسبي</td>
                <td className="py-4 px-6 font-sans text-indigo-400 tracking-wide font-medium uppercase text-sm">Ratio</td>
                <td className="py-4 px-6 text-slate-300 text-sm">أرقى المستويات، وجود صفر حقيقي، يسمح بكافة العمليات الحسابية.</td>
                <td className="py-4 px-6 text-slate-300 text-sm italic">زمن الرجع، الوزن، الطول، الدخل الشهري.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl">
          <p className="text-xs text-indigo-200 leading-relaxed">
            * ملاحظة أكاديمية: اختيار مستوى القياس يحدد نوع المعالجة الإحصائية (بارامترية أو لابارامترية) المسموح بها للبيانات.
          </p>
        </div>
      </section>
    </div>
  );
};
