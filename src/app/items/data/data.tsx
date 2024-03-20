import { GiDwarfHelmet } from "react-icons/gi";
import { FaH, FaL, FaM, FaS, FaA } from "react-icons/fa6";

import { MdEngineering, MdMedicalServices } from "react-icons/md";
import { GiAbdominalArmor } from "react-icons/gi";
import { MdElectricalServices } from "react-icons/md";

export const types = [
  {
    value: "Heavy Armor",
    label: "Heavy Armor",
    icon: FaH,
  },
  {
    value: "Medium Armor",
    label: "Medium Armor",
    icon: FaM,
  },
  {
    value: "Light Armor",
    label: "Light Armor",
    icon: FaL,
  },
  {
    value: "Helm",
    label: "Helm",
    icon: GiDwarfHelmet,
  },
];

export const passives = [
  {
    value: "ENGINEERING KIT",
    label: "Heavy Armor",
    icon: MdEngineering,
  },
  {
    value: "STANDARD ISSUE",
    label: "Medium Armor",
    icon: FaS,
  },
  {
    value: "MED-KIT",
    label: "Light Armor",
    icon: MdMedicalServices,
  },
  {
    value: "SERVO-ASSISTED",
    label: "Helm",
    icon: FaA,
  },
  {
    value: "FORTIFIED",
    label: "Helm",
    icon: GiAbdominalArmor,
  },
  {
    value: "ELECTRICAL CONDUIT",
    label: "Helm",
    icon: MdElectricalServices,
  },
];
