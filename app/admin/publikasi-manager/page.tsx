import PublicationManager from './PublicationManager';

export default function PublikasiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Publikasi / Buletin</h1>
        <p className="text-gray-500 mt-2">Upload publikasi atau buletin untuk ditampilkan di situs.</p>
      </div>

      <PublicationManager />
    </div>
  );
}
