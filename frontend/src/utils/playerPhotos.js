export const STAR_PLAYERS = [
  { name: 'Cristiano Ronaldo', sport: 'FUTSAL', photo: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg' },
  { name: 'Babar Azam', sport: 'CRICKET', photo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Babar_Azam_%28cropped%29.jpg' },
  { name: 'Lionel Messi', sport: 'FUTSAL', photo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg' },
  { name: 'Shaheen Afridi', sport: 'CRICKET', photo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Shaheen_Afridi.jpg' },
  { name: 'Mohammad Rizwan', sport: 'CRICKET', photo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Mohammad_Rizwan.jpg' },
  { name: 'Kylian Mbappé', sport: 'FUTSAL', photo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/2019-06-11_Soccer_Euro_Qualifiers_Andorra_vs._France_Kylian_Mbapp%C3%A9_11.jpg' },
  { name: 'Virat Kohli', sport: 'CRICKET', photo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_balcony_celebrations.jpg' },
  { name: 'LeBron James', sport: 'BASKETBALL', photo: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/LeBron_James_crop_2018.jpg' },
  { name: 'Neymar Jr', sport: 'FUTSAL', photo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_FC_Barcelona.jpg' }
];

export function getPlayerPhoto(player, index = 0) {
  if (player?.profile_photo_url && typeof player.profile_photo_url === 'string' && player.profile_photo_url.startsWith('http')) {
    return player.profile_photo_url;
  }
  const name = (player?.display_name || '').toLowerCase();
  if (name.includes('babar')) return STAR_PLAYERS[1].photo;
  if (name.includes('ronaldo') || name.includes('cris')) return STAR_PLAYERS[0].photo;
  if (name.includes('messi')) return STAR_PLAYERS[2].photo;
  if (name.includes('shaheen')) return STAR_PLAYERS[3].photo;
  if (name.includes('rizwan')) return STAR_PLAYERS[4].photo;
  if (name.includes('mbappe')) return STAR_PLAYERS[5].photo;
  if (name.includes('kohli')) return STAR_PLAYERS[6].photo;
  if (name.includes('lebron')) return STAR_PLAYERS[7].photo;
  if (name.includes('neymar')) return STAR_PLAYERS[8].photo;

  const validIndex = typeof index === 'number' && !isNaN(index) ? Math.abs(Math.floor(index)) : 0;
  return STAR_PLAYERS[validIndex % STAR_PLAYERS.length].photo;
}
