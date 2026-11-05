import { storeToRefs } from "pinia";
import { useCompaniesStore } from "../stores/companiesStore";

export const useCompanies = () => {
    const store = useCompaniesStore();
    return {
        ...storeToRefs(store),
        loadMine: store.loadMine,
        create: store.create,
        update: store.update,
        loadDetails: store.loadDetails,
        loadMembers: store.loadMembers,
        addMember: store.addMember,
        removeMember: store.removeMember,
        loadVehicles: store.loadVehicles,
        loadCompanyResources: store.loadCompanyResources,
        addVehicle: store.addVehicle,
    };
};
