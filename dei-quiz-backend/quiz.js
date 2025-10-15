const quiz = [
  { 
    text: "Fairness means treating everyone by the same rules, even if outcomes are unequal.", 
    mapping: { Equalizer: 1.0, Bridgebuilder: -0.3, Catalyst: -0.2, "Devil Advocate": -0.5 } 
  },
  { 
    text: "Hiring for diversity should focus on who best connects us to new communities and clients.", 
    mapping: { Bridgebuilder: 1.0, Equalizer: -0.2, Catalyst: 0.3, "Devil Advocate": -0.3 } 
  },
  { 
    text: "Real progress happens only when diverse viewpoints challenge our comfort zones.", 
    mapping: { Catalyst: 1.0, Equalizer: -0.4, Bridgebuilder: 0.2, "Devil Advocate": 0.4 } 
  },
  { 
    text: "If systems are unjust, breaking norms or angering funders is sometimes necessary.", 
    mapping: { "Devil Advocate": 1.0, Equalizer: -0.5, Bridgebuilder: -0.2, Catalyst: 0.3 } 
  },
  { 
    text: "Representation that exists only for appearances is worse than none at all.", 
    mapping: { Bridgebuilder: 0.6, "Devil Advocate": 0.8, Equalizer: -0.3, Catalyst: 0.2 } 
  },
  { 
    text: "It's better to keep harmony in the workplace than to risk conflict over diversity issues.", 
    mapping: { Equalizer: 0.8, Bridgebuilder: 0.4, Catalyst: -0.6, "Devil Advocate": -0.8 } 
  },
  { 
    text: "When inclusion efforts face backlash, leaders should push harder, not pull back.", 
    mapping: { Catalyst: 0.7, "Devil Advocate": 0.6, Equalizer: -0.5, Bridgebuilder: -0.2 } 
  }
];

export default quiz;
