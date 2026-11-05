import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { companiesService } from "../services/companies/companiesService";
import type {
    Company,
    CompanyInput,
    CompanyMember,
    CompanyMemberInput,
    CompanyVehicle,
    CompanyVehicleInput,
} from "../types/companies";

export const useCompaniesStore = defineStore("companies", () => {
    const items = ref<Company[]>([]);
    const currentCompany = ref<Company | null>(null);
    const members = ref<CompanyMember[]>([]);
    const vehicles = ref<CompanyVehicle[]>([]);
    const loading = ref(false);
    let resourcesRequest = 0;
    const companyID = computed(() => currentCompany.value?.id ?? "");
    const loadMine = async () => {
        loading.value = true;
        try {
            items.value = await companiesService.list();
            currentCompany.value =
                currentCompany.value &&
                items.value.some((item) => item.id === currentCompany.value?.id)
                    ? currentCompany.value
                    : (items.value[0] ?? null);
        } finally {
            loading.value = false;
        }
    };
    const create = async (input: CompanyInput) => {
        loading.value = true;
        try {
            const item = await companiesService.create(input);
            items.value.unshift(item);
            currentCompany.value = item;
            return item;
        } finally {
            loading.value = false;
        }
    };
    const loadDetails = async (id = companyID.value) => {
        if (!id) return;
        loading.value = true;
        try {
            currentCompany.value = await companiesService.get(id);
        } finally {
            loading.value = false;
        }
    };
    const update = async (input: CompanyInput, id = companyID.value) => {
        loading.value = true;
        try {
            const item = await companiesService.update(id, input);
            currentCompany.value = item;
            items.value = items.value.map((company) => company.id === item.id ? item : company);
            return item;
        } finally {
            loading.value = false;
        }
    };
    const loadMembers = async (id = companyID.value) => {
        if (!id) return;
        loading.value = true;
        try {
            members.value = await companiesService.members(id);
        } finally {
            loading.value = false;
        }
    };
    const addMember = async (input: CompanyMemberInput, id = companyID.value) => {
        loading.value = true;
        try {
            await companiesService.addMember(id, input);
            await loadMembers(id);
        } finally {
            loading.value = false;
        }
    };
    const removeMember = async (userID: string, id = companyID.value) => {
        loading.value = true;
        try {
            await companiesService.removeMember(id, userID);
            members.value = members.value.filter((item) => item.user_id !== userID);
        } finally {
            loading.value = false;
        }
    };
    const loadVehicles = async (id = companyID.value) => {
        if (!id) return;
        loading.value = true;
        try {
            vehicles.value = await companiesService.vehicles(id);
        } finally {
            loading.value = false;
        }
    };
    const loadCompanyResources = async (id: string) => {
        const requestID = ++resourcesRequest;
        members.value = [];
        vehicles.value = [];
        if (!id) return;
        loading.value = true;
        try {
            const [companyMembers, companyVehicles] = await Promise.all([
                companiesService.members(id),
                companiesService.vehicles(id),
            ]);
            if (requestID === resourcesRequest) {
                members.value = companyMembers;
                vehicles.value = companyVehicles;
            }
        } finally {
            if (requestID === resourcesRequest) loading.value = false;
        }
    };
    const addVehicle = async (input: CompanyVehicleInput, id = companyID.value) => {
        loading.value = true;
        try {
            vehicles.value.unshift(await companiesService.addVehicle(id, input));
        } finally {
            loading.value = false;
        }
    };
    return {
        items,
        currentCompany,
        companyID,
        members,
        vehicles,
        loading,
        loadMine,
        create,
        loadDetails,
        update,
        loadMembers,
        addMember,
        removeMember,
        loadVehicles,
        loadCompanyResources,
        addVehicle,
    };
});
