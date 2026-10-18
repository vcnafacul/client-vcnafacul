/** Seção que não respondeu (502 do ms): só ela, sem toast (tickets/044, card 07). */
export function Indisponivel({ altura = 320 }: { altura?: number }) {
  return (
    <div
      role="status"
      style={{ minHeight: altura }}
      className="flex items-center justify-center rounded border border-dashed border-lightGray bg-white p-4 text-sm text-grey"
    >
      Indisponível agora. Tente de novo em alguns minutos.
    </div>
  );
}
