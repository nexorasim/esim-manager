import { IProfileTemplate } from '../models/ProfileTemplate';
export declare class ProfileTemplateService {
    getTemplates(): Promise<IProfileTemplate[]>;
    getTemplate(id: string): Promise<IProfileTemplate | null>;
    createTemplate(data: {
        name: string;
        description?: string;
        provider?: string;
        profileClass?: 'operational' | 'test' | 'provisioning';
        defaultNotes?: string;
        metadata?: Record<string, any>;
        createdBy: string;
    }): Promise<IProfileTemplate>;
    updateTemplate(id: string, updates: Partial<IProfileTemplate>): Promise<IProfileTemplate | null>;
    deleteTemplate(id: string): Promise<boolean>;
}
//# sourceMappingURL=ProfileTemplateService.d.ts.map