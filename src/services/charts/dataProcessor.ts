function normalizeName(name: string): string {
    return name.replace(/\([^)]*\)/g, '').trim();
}

export function getColor(name: string): string {
    const COLOR_MAP: Record<string, string> = {
        //Offensive moves
        'DHO': '#66c5cc',
        'Drive Kick': '#f6cf71',
        'Flare': '#f89c74',
        'Iso': '#dcb0f2',
        'Lift': '#87c55f',
        'Pin Down': '#9eb9f3',
        'PnPop': '#fe88b1',
        'PnR': '#c9db74',
        'Post Kick Out': '#8be0a4',
        'Spot Up': '#b497e7',
        //Area
        'Left Corner': '#66c5cc',
        'Left Wing': '#f6cf71',
        'Top': '#f89c74',
        'Right Wing': '#dcb0f2',
        'Right Corner': '#87c55f',
        //Player Direction
        'Left': '#66c5cc',
        'Right': '#f6cf71',
        'To Hoop': '#dcb0f2',
        'Away From Hoop': '#87c55f',
        'Stationary': '#9eb9f3',
        //Pass Direction
        'From Hoop': '#f89c74',
        'Off the Dribble': '#2c9ec5',
        //Off Dribble hand
        'Left to RightPickUp': '#87c55f',
        'Right to LeftPickup': '#9eb9f3',
        'Catch & Shoot': '#2c9ec5',
        //Footwork
        'Hop': '#66c5cc',
        '1-2 Right/Left': '#f6cf71',
        '1-2 Left/Right': '#f89c74',
        //Defender Distance
        'Tight': '#66c5cc',
        'Close': '#f6cf71',
        'Open': '#f89c74',
        'Wide Open': '#87c55f',
    };

    const cleanName = normalizeName(name);
    return COLOR_MAP[cleanName] || '#b3b3b3';
}

export function getAbbreviation(name: string): string {

    const ABB_MAP: Record<string, string> = {
        //Offensive moves
        'DHO': 'DHO',
        'Drive Kick': 'DK',
        'Flare': 'F',
        'Iso': 'I',
        'Lift': 'L',
        'Pin Down': 'PD',
        'PnPop': 'PnP',
        'PnR': 'PnR',
        'Post Kick Out': 'PKO',
        'Spot Up': 'SU',
        //Area
        'Left Corner': 'LC',
        'Left Wing': 'LW',
        'Top': 'T',
        'Right Wing': 'RW',
        'Right Corner': 'RC',
        //Player Direction
        'Left': 'L',
        'Right': 'R',
        'To Hoop': 'TH',
        'Away From Hoop': 'AFH',
        'Stationary': 'S',
        //Pass Direction
        'From Hoop': 'FH',
        'Off the Dribble': 'OtD',
        //Off Dribble hand
        'Left to RightPickUp': 'LtR',
        'Right to LeftPickup': 'RtL',
        'Catch & Shoot': 'C&S',
        //Footwork
        'Hop': 'H',
        '1-2 Right/Left': 'R/L',
        '1-2 Left/Right': 'L/R',
        //Defender Distance
        'Tight': 'T',
        'Close': 'C',
        'Open': 'O',
        'Wide Open': 'WO',
    }

    const cleanName = normalizeName(name);
    return ABB_MAP[cleanName] || 'Null'
}