(function () {
  var reactElementType = Symbol.for('react.element');

  function jsx(type, props, key) {
    return {
      $$typeof: reactElementType,
      type: type,
      key: key == null ? null : String(key),
      ref: null,
      props: props || {},
      _owner: null,
      _store: {},
    };
  }

  function ZoneCard(props) {
    return jsx('div', {
      className: 'rounded-[1.4rem] border border-orange-100 bg-white px-4 py-3 shadow-soft',
      children: [
        jsx('p', {
          className: 'text-[11px] font-black uppercase tracking-[0.18em] text-stone-400',
          children: 'commune',
        }),
        jsx('p', {
          className: 'mt-2 text-sm font-black text-[#2a190f]',
          children: props.zone,
        }),
        jsx('p', {
          className: 'mt-1 text-xs leading-5 text-stone-500',
          children: "Retrait ou livraison selon l'offre visible sur la fiche.",
        }),
      ],
    });
  }

  window.ZoneCard = ZoneCard;
})();