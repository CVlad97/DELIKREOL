export type MartiniqueCommune = {
  name: string;
  aliases: string[];
};

export const martiniqueCommunes: MartiniqueCommune[] = [
  { name: 'Ajoupa-Bouillon', aliases: ['ajoupa bouillon', 'ajoupa'] },
  { name: 'Anses-d’Arlet', aliases: ['anses arlet', 'les anses d arlet', 'anse d arlet'] },
  { name: 'Basse-Pointe', aliases: ['basse pointe'] },
  { name: 'Bellefontaine', aliases: ['belle fontaine'] },
  { name: 'Carbet', aliases: ['le carbet'] },
  { name: 'Case-Pilote', aliases: ['case pilote'] },
  { name: 'Diamant', aliases: ['le diamant'] },
  { name: 'Ducos', aliases: [] },
  { name: 'Fonds-Saint-Denis', aliases: ['fonds saint denis'] },
  { name: 'Fort-de-France', aliases: ['fort de france', 'fdf', 'fortdefrance'] },
  { name: 'François', aliases: ['le francois', 'francois'] },
  { name: 'Grand’Rivière', aliases: ['grand riviere', 'grande riviere'] },
  { name: 'Gros-Morne', aliases: ['gros morne'] },
  { name: 'Lamentin', aliases: ['le lamentin'] },
  { name: 'Lorrain', aliases: ['le lorrain'] },
  { name: 'Macouba', aliases: [] },
  { name: 'Marigot', aliases: ['le marigot'] },
  { name: 'Marin', aliases: ['le marin'] },
  { name: 'Morne-Rouge', aliases: ['le morne rouge', 'morne rouge'] },
  { name: 'Morne-Vert', aliases: ['le morne vert', 'morne vert'] },
  { name: 'Prêcheur', aliases: ['le precheur', 'precheur'] },
  { name: 'Rivière-Pilote', aliases: ['riviere pilote', 'rivière pilote'] },
  { name: 'Rivière-Salée', aliases: ['riviere salee', 'rivière salée'] },
  { name: 'Robert', aliases: ['le robert'] },
  { name: 'Sainte-Anne', aliases: ['ste anne', 'sainte anne'] },
  { name: 'Sainte-Luce', aliases: ['ste luce', 'sainte luce'] },
  { name: 'Sainte-Marie', aliases: ['ste marie', 'sainte marie'] },
  { name: 'Saint-Esprit', aliases: ['st esprit', 'saint esprit'] },
  { name: 'Saint-Joseph', aliases: ['st joseph', 'saint joseph'] },
  { name: 'Saint-Pierre', aliases: ['st pierre', 'saint pierre'] },
  { name: 'Schœlcher', aliases: ['schoelcher', 'scholcher'] },
  { name: 'Trinité', aliases: ['la trinite', 'trinite'] },
  { name: 'Trois-Îlets', aliases: ['trois ilets', 'les trois ilets', 'trois-ilets'] },
  { name: 'Vauclin', aliases: ['le vauclin'] },
];

export function normalizeCommuneQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function findCommune(value: string) {
  const query = normalizeCommuneQuery(value);
  return martiniqueCommunes.find((commune) => {
    const names = [commune.name, ...commune.aliases].map(normalizeCommuneQuery);
    return names.includes(query);
  });
}
