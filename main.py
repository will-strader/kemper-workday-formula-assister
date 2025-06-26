# Defining block for WD_Split and CC_Hierarchy_PS fields

# THIS COULD BE TURNED INTO AN INPUT FUNCTION LATER FOR GENERALIZING

# Other note: send this script to myself to put on my GitHub profile

wd_split = ["A&O", "Corporate Costs", "DCC", "FEE", "INVEST", "IPCC"]

cc_hierarchy_ps_raw = [

    "AH_L&H_Life_Kemper Life(Uncategorized)", "AH-Corp-OH Allocated", "AH-Corp-OH Unallocated",

    "AH-Corporate(Uncategorized)", "AH-Corp-Overhead(Uncategorized)", "AH-Corp-Purchased Services",

    "AH-Discontinued Operations", "AH-L&H-Health", "AH-L&H-Life(Uncategorized)",

    "AH-L&H-Life and Health(Uncategorized)", "AH-L&H-Life-KemperLife-Executive",

    "AH-L&H-Life-KemperLife-Finance", "AH-L&H-Life-KemperLife-Information Technology",

    "AH-L&H-Life-KemperLife-Legal", "AH-L&H-Life-KemperLife-Operations",

    "AH-L&H-Life-KemperLife-Product & Pricing", "AH-L&H-Life-KemperLife-Sales & Marketing",

    "AH-L&H-Life-KemperLife-Underwriting", "AH-L&H-Purchased Services", "AH-L&H-Shared Service",

    "AH-P&C-AAC(Uncategorized)", "AH-P&C-AAC-Ops", "AH-P&C-AAC-PGAAP", "AH-P&C-AAC-Products & Pricing",

    "AH-P&C-AAC-Purchased Services", "AH-P&C-AAC-Shared Services", "AH-P&C-AAC-Sales & Marketing",

    "AH-P&C-Kemper Auto", "AH-P&C-Kemper Personal Insurance", "AH-P&C-Newins",

    "AH-P&C-Property and Casualty(Uncategorized)", "AH-P&C-Purchased Services", "AH-P&C-Reciprocal",

    "AH-P&C-Shared Services", "CC_Hierarchy_PS(Uncategorized)"

]


# Replace (Uncategorized) with (-) since that's how it appears in the Workday internal system
cc_hierarchy_ps_cleaned = [entry.replace("(Uncategorized)", "(-)") for entry in cc_hierarchy_ps_raw]


# Generate all combinations needed
wd_output_lines = [
    f"ACCT.General_Expenses_without_Fee_Income[WD_Split=SPL_{wd}]"
    for wd in wd_split
]

 

cc_output_lines = [
    f"ACCT.General_Expenses_without_Fee_Income[CC_Hierarchy_PS={cc}]"
    for cc in cc_hierarchy_ps_cleaned
]

# Join all wd_output_lines with '+' (Workday "or" operator)
final_wd_output = " +\n".join(wd_output_lines)

# Join all cc_output_lines with '+' (Workday "or" operator)
final_cc_output = " +\n".join(cc_output_lines)

# Wrap each section in parentheses and join with '*' (Workday "and" operator)
final_output = f"({final_wd_output}) \n * \n ({final_cc_output})"


# Save to file or print
with open("generated_output.txt", "w") as f:

    f.write(final_output)

print("Output saved to 'generated_output.txt'") # Successful save
