
interface IMemoryPlayerSharing {
    isTimeUsed: boolean;
    sharelink: string;
    sharelinkTime: string;
    cancelTimer(): void;
    setShareVal(key: string, value: any): void;
    share(): void;
    updateTime(updatedTime: string): void;
    useTime(): void;
}
