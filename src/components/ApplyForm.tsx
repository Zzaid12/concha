// components/ApplyForm.tsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

type ApplyFormProps = {
  jobId: string;
  userId: string;
  onClose: () => void;
};

export default function ApplyForm({ jobId, userId, onClose }: ApplyFormProps) {
  const [coverLetter, setCoverLetter] = useState('');

  const handleApply = async () => {
    const { error } = await supabase
      .from('applications')
      .insert({ job_id: jobId, user_id: userId, cover_letter: coverLetter });
    if (error) {
      alert(`Error aplicando: ${error.message}`);
      return;
    }
    alert('Aplicación enviada');
    onClose();
  };

  return (
    <div className="apply-form">
      <h3>Aplicar a la oferta</h3>
      <textarea 
        placeholder="Carta de presentación..."
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
      ></textarea>
      <button onClick={handleApply}>Enviar Aplicación</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
